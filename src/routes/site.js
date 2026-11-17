// Page routes. The site is public: every visitor sees every function.

import { cookieHeader } from '../lib/session.js';
import { allEvents, nextEvent } from '../lib/visibility.js';
import { buildIcs } from '../lib/calendar.js';
import { qrSvg } from '../lib/qr.js';
import { homePage, thankYouPage, notFoundPage } from '../views/pages/home.js';
import { eventsPage, stylePage, travelPage } from '../views/pages/info.js';
import { storyPage, familyPage } from '../views/pages/content.js';
import { rsvpPage } from '../views/pages/rsvp.js';
import { validateRsvp, rsvpMessage, whatsappUrl, rsvpOpen } from '../lib/rsvp.js';

const send = (res, page, status = 200) => res.status(status).type('html').send(String(page));

export function siteRoutes(app, deps) {
  const { config, baseUrl, https, now } = deps;
  const events = allEvents(config);

  app.get('/lang/:code', (req, res) => {
    const code = config.languages.includes(req.params.code) ? req.params.code : config.defaultLanguage;
    res.setHeader('Set-Cookie', cookieHeader('lang', code, { maxAge: 365 * 86400, secure: https }));
    const next = typeof req.query.next === 'string' && /^\/(?!\/)/.test(req.query.next) ? req.query.next : '/';
    res.redirect(303, next);
  });

  // ── Pages ───────────────────────────────────────────────────────────────
  app.get('/', async (req, res) => {
    const c = res.locals.c;
    if (c.mode === 'thankyou') {
      const photos = config.story.gallery.map((g) => ({ full: g.src, thumb: g.thumb, alt: c.tr(g.alt) }));
      const link = config.thankYou.photosLink;
      return send(res, thankYouPage(c, { photos, photosQr: link?.url ? await qrSvg(link.url) : '' }));
    }
    const t = c.now;
    const liveEvent = events.find((e) => Date.parse(e.start) <= t && t < Date.parse(e.end)) || null;
    send(res, homePage(c, { events, liveEvent, upNext: nextEvent(events, t) }));
  });

  app.get('/events', (req, res) => send(res, eventsPage(res.locals.c, { events })));
  app.get('/style', (req, res) => send(res, stylePage(res.locals.c, { events })));
  app.get('/travel', (req, res) => send(res, travelPage(res.locals.c)));
  app.get('/story', (req, res) => send(res, storyPage(res.locals.c)));
  app.get('/family', (req, res) => send(res, familyPage(res.locals.c)));

  // ── RSVP (by WhatsApp; nothing is stored) ───────────────────────────────
  app.get('/rsvp', (req, res) => {
    const c = res.locals.c;
    send(res, rsvpPage(c, { events, open: rsvpOpen(c.mode) }));
  });

  app.post('/rsvp', (req, res) => {
    const c = res.locals.c;
    if (!rsvpOpen(c.mode)) return send(res, rsvpPage(c, { events, open: false }), 403);
    const { ok, value, errors } = validateRsvp(req.body, config);
    if (!ok) return send(res, rsvpPage(c, { events, values: value, errors }), 422);
    res.redirect(303, whatsappUrl(config.rsvp.whatsapp, rsvpMessage(value, c)));
  });

  // ── Calendar files ──────────────────────────────────────────────────────
  app.get('/cal/:file', (req, res) => {
    const c = res.locals.c;
    const id = req.params.file.replace(/\.ics$/, '');
    const list = id === 'all' ? events : events.filter((e) => e.id === id);
    if (!list.length) return send(res, notFoundPage(c), 404);
    res.type('text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.ics"`);
    res.send(buildIcs(config, list, { tr: c.tr, host: new URL(baseUrl).host, now: now() }));
  });

  // ── Misc ────────────────────────────────────────────────────────────────
  app.get('/robots.txt', (req, res) => {
    res.type('text').send(config.indexable ? 'User-agent: *\nDisallow: /api/\n' : 'User-agent: *\nDisallow: /\n');
  });

  app.get('/manifest.webmanifest', (req, res) => {
    res.type('application/manifest+json').send(JSON.stringify({
      name: `${config.couple.names.en} · ${config.hashtag}`,
      short_name: config.couple.names.en,
      start_url: '/',
      display: 'standalone',
      background_color: '#170406',
      theme_color: '#170406',
      icons: [{ src: '/img/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png' }],
    }));
  });
}
