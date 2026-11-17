// Shared view pieces.

import { html, raw } from '../lib/html.js';
import { icon, divider, corner } from './motifs.js';
import { fmtDate, fmtTime } from '../lib/time.js';
import { googleCalendarUrl } from '../lib/calendar.js';
import { dressFor } from '../lib/visibility.js';

export const pageHead = (title, intro, { eyebrow = '' } = {}) => html`
<header class="page-head">
  ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}
  <h1>${title}</h1>
  <span class="gold">${divider}</span>
  ${intro ? html`<p class="lede">${intro}</p>` : ''}
</header>`;

// Darken an event colour until white text on it (and it on cream) meets WCAG AA 4.5:1
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const inkCache = new Map();
export function evInk(hex) {
  if (inkCache.has(hex)) return inkCache.get(hex);
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  let out = hex;
  // 5.3:1 against white keeps ≥4.5:1 against the cream paper too
  while (1.05 / (lum(out) + 0.05) < 5.3) {
    [r, g, b] = [r, g, b].map((c) => Math.round(c * 0.92));
    out = `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  }
  inkCache.set(hex, out);
  return out;
}

export const eventStyle = (ev) => raw(`style="--ev:${ev.color};--ev-ink:${evInk(ev.color)};--ev-tint:${ev.tint}"`);

export function eventCard(c, ev, { compact = false } = {}) {
  const { t, tr, lang, config } = c;
  const venue = config.venues[ev.venue];
  const dress = dressFor(config, ev);
  return html`
<article class="event-card ${compact ? 'compact' : ''}" id="ev-${ev.id}" ${eventStyle(ev)} aria-labelledby="ev-${ev.id}-title">
  ${corner}
  <div class="event-top">
    <span class="event-icon">${icon(ev.icon)}</span>
    <div>
      <p class="event-date">${fmtDate(ev.start, lang)}</p>
      <h2 class="event-name" id="ev-${ev.id}-title">${tr(ev.name)}</h2>
      ${ev.tagline ? html`<p class="event-tagline">${tr(ev.tagline)}</p>` : ''}
    </div>
  </div>
  <dl class="event-meta">
    <div><dt>${icon('clock')}<span class="sr-only">${t('when')}</span></dt><dd><strong>${t('from_time', { time: fmtTime(ev.start, lang) })}</strong></dd></div>
    <div><dt>${icon('pin')}<span class="sr-only">${t('where')}</span></dt><dd><strong>${tr(venue.name)}</strong><br><span class="muted">${tr(venue.address)}</span></dd></div>
    ${compact || !dress ? '' : html`<div><dt>${icon('style')}<span class="sr-only">${t('dress_code')}</span></dt><dd>${t('dress_code')}: <a href="/style">${tr(dress.title)}</a></dd></div>`}
  </dl>
  ${compact ? '' : html`
  <details class="ritual">
    <summary>${t('what_happens')}</summary>
    <p>${tr(ev.ritual)}</p>
  </details>`}
  <div class="event-actions">
    <a class="btn btn-ev" href="${venue.directionsUrl || venue.mapsUrl}" target="_blank" rel="noopener">${icon('pin')}<span>${t('directions')}</span></a>
    <details class="cal-menu">
      <summary class="btn btn-ghost">${icon('calendar')}<span>${t('add_to_calendar')}</span></summary>
      <div class="cal-options">
        <a href="${googleCalendarUrl(config, ev, tr)}" target="_blank" rel="noopener">${t('google_calendar')}</a>
        <a href="/cal/${ev.id}.ics" download>${t('apple_calendar')}</a>
      </div>
    </details>
  </div>
</article>`;
}

// Pastel Carnival mood board: four textured swatch tiles + who wears what
export function moodBoard(c, dress) {
  const { t, tr } = c;
  const [lav, lav2, peach, peach2, pearl] = dress.palette;
  const tiles = [
    ['lavender', { en: 'Lavender', hi: 'लैवेंडर' }, `--a:${lav};--b:${lav2}`],
    ['peach', { en: 'Peach', hi: 'पीच' }, `--a:${peach};--b:${peach2}`],
    ['pastels', { en: 'Pastels', hi: 'पेस्टल' }, `--a:${lav};--b:${peach}`],
    ['pearls', { en: 'Pearls', hi: 'मोती' }, `--a:${pearl};--b:${lav2}`],
  ];
  return html`
<div class="mood" aria-hidden="true">
  ${tiles.map(([cls, label, vars]) => html`<div class="mood-tile mt-${cls}" style="${vars}"><span>${tr(label)}</span></div>`)}
  ${(dress.inspiration || []).map((p) => html`<figure class="mood-tile photo"><img src="${p.src}" alt="" loading="lazy" decoding="async"></figure>`)}
</div>
<div class="forwho">
  <div><b><i style="background:${lav}"></i>${t('for_women')}</b><p>${tr(dress.women)}</p></div>
  <div><b><i style="background:${peach}"></i>${t('for_men')}</b><p>${tr(dress.men)}</p></div>
</div>`;
}

// "For any queries" phone numbers, each with Call / WhatsApp buttons
export function contactsCard(c) {
  const { t, config } = c;
  const fmt = (n) => {
    const d = n.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  };
  return html`
<div class="card paper-card center">
  ${config.contacts.map((n) => html`
  <p class="phone">${fmt(n)}</p>
  <div class="row">
    <a class="btn btn-line" href="tel:${n}">${icon('phone')}<span>${t('call')}</span></a>
    <a class="btn btn-line" href="https://wa.me/${n.replace(/\D/g, '')}" target="_blank" rel="noopener">${icon('whatsapp')}<span>WhatsApp</span></a>
  </div>`)}
</div>`;
}


export const avatar = (name, photo) =>
  photo
    ? html`<img class="avatar" src="${photo}" alt="" loading="lazy" decoding="async" width="96" height="96">`
    : html`<span class="avatar avatar-mono" aria-hidden="true">${[...name.replace(/^(Dr\.|डॉ\.|Shri|Smt\.|श्री|श्रीमती)\s*/, '')][0]}</span>`;

