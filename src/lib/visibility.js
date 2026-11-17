// Schedule helpers. Kept pure (no I/O) so they're easy to test.

const ts = (iso) => new Date(iso).getTime();
const byStart = (a, b) => ts(a.start) - ts(b.start);

// Every function, in chronological order
export const allEvents = (config) => [...config.events].sort(byStart);

// 'upcoming' before the first event, 'live' during the wedding,
// 'thankyou' once the final event has ended.
export function siteMode(config, now = Date.now()) {
  const sorted = allEvents(config);
  if (!sorted.length) return 'upcoming';
  const lastEnd = Math.max(...sorted.map((e) => ts(e.end)));
  if (now >= lastEnd) return 'thankyou';
  if (now >= ts(sorted[0].start)) return 'live';
  return 'upcoming';
}

export function nextEvent(events, now = Date.now()) {
  return [...events].sort(byStart).find((e) => ts(e.end) > now) || null;
}

export const mainEvent = (config) => config.events.find((e) => e.id === config.mainEventId) || config.events[0];

// An event's dress code, or null when guests can wear whatever they like
export const dressFor = (config, ev) => ev.dress || null;

// Day-by-day programme: functions plus non-function items (meals), grouped by
// IST date, chronological.
export function programme(config, events) {
  const items = [
    ...events.map((e) => ({ time: e.start, name: e.name, tagline: e.tagline, event: e })),
    ...(config.programmeExtras || []).filter((x) => events.some((e) => e.start.slice(0, 10) === x.time.slice(0, 10))).map((x) => ({ time: x.time, name: x.name })),
  ].sort((a, b) => ts(a.time) - ts(b.time));
  const days = new Map();
  for (const it of items) {
    const key = it.time.slice(0, 10);
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(it);
  }
  return [...days].map(([date, list]) => ({ date, items: list }));
}
