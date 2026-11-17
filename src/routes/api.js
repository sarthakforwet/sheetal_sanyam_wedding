// JSON endpoints: weather and the AI concierge.

import { askConcierge, sanitizeHistory, conciergeEnabled, buildKnowledge } from '../lib/concierge.js';
import { getWeather } from '../lib/weather.js';

export function apiRoutes(app, deps) {
  const { config, limiter, env, now } = deps;
  const knowledge = buildKnowledge(config);

  // ── Weather ─────────────────────────────────────────────────────────────
  app.get('/api/weather', async (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.json(await getWeather(config, { now: now() }));
  });

  // ── Concierge ───────────────────────────────────────────────────────────
  app.post('/api/concierge',
    limiter.limit('concierge-min', 8, 60_000),
    limiter.limit('concierge-day', 80, 24 * 3600_000),
    async (req, res) => {
      if (!conciergeEnabled(env)) return res.status(404).json({ error: 'disabled' });
      const messages = sanitizeHistory(req.body?.messages);
      if (!messages) return res.status(422).json({ error: 'invalid' });
      try {
        const { text } = await askConcierge({
          config, env, now: now(), knowledge, messages,
        });
        res.json({ text });
      } catch (err) {
        console.error('[concierge]', err.status || '', err.message);
        res.status(502).json({ error: 'upstream', coordinator: `https://wa.me/${config.coordinator.whatsapp.replace(/\D/g, '')}` });
      }
    });
}
