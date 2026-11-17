// Forecast for the wedding dates from Open-Meteo (free, no API key). Forecasts
// only reach ~16 days ahead, so earlier than that we return the configured
// typical-weather note. Results are cached for an hour.

import { istDateKey } from './time.js';

const HOUR = 3600_000;
let cache = { at: 0, key: '', value: null };

const WMO = {
  0: 'clear', 1: 'mostly_clear', 2: 'partly_cloudy', 3: 'cloudy', 45: 'fog', 48: 'fog',
  51: 'drizzle', 53: 'drizzle', 55: 'drizzle', 61: 'rain', 63: 'rain', 65: 'rain',
  80: 'showers', 81: 'showers', 82: 'showers', 95: 'storm', 96: 'storm', 99: 'storm',
};

export async function getWeather(config, { now = Date.now(), fetchImpl = globalThis.fetch } = {}) {
  const days = [...new Set(config.events.map((e) => istDateKey(e.start)))].sort();
  const key = days.join(',');
  if (cache.value && cache.key === key && now - cache.at < HOUR) return cache.value;

  const fallback = { source: 'typical', days: days.map((date) => ({ date, highC: config.weather.typical.highC, lowC: config.weather.typical.lowC, code: 'clear' })) };
  const msUntilFirst = new Date(`${days[0]}T00:00:00+05:30`).getTime() - now;
  const lastDay = new Date(`${days[days.length - 1]}T23:59:59+05:30`).getTime();
  if (msUntilFirst > 15 * 24 * HOUR || now > lastDay) return fallback;

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: config.location.lat,
      longitude: config.location.lng,
      daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max',
      timezone: config.timezone,
      start_date: days[0],
      end_date: days[days.length - 1],
    });
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const json = await res.json();
    const d = json.daily;
    const value = {
      source: 'forecast',
      days: d.time.map((date, i) => ({
        date,
        highC: Math.round(d.temperature_2m_max[i]),
        lowC: Math.round(d.temperature_2m_min[i]),
        code: WMO[d.weathercode[i]] || 'partly_cloudy',
        rainChance: d.precipitation_probability_max?.[i] ?? null,
      })),
    };
    cache = { at: now, key, value };
    return value;
  } catch {
    return fallback;
  }
}
