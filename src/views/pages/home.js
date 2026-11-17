import { html, raw } from '../../lib/html.js';
import { layout, shareUrl } from '../layout.js';
import { icon, mandala, seal, diya, divider } from '../motifs.js';
import { pageHead, eventStyle, contactsCard } from '../components.js';
import { programmeCard } from './info.js';
import { rsvpBanner } from './rsvp.js';
import { rsvpOpen } from '../../lib/rsvp.js';

function countdownParts(target, now) {
  let s = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60);
  return { d, h, m, s: s - m * 60 };
}

// First-visit invitation: wine envelope, gold seal, cream letter
function envelope(c) {
  const { config, t, tr } = c;
  const inv = config.invitation;
  return html`
<div class="invite-overlay" id="invite" role="dialog" aria-modal="true" aria-label="${t('open_invite')}">
  <div class="curtain l" aria-hidden="true"></div><div class="curtain r" aria-hidden="true"></div>
  <div class="invite-inner">
    <p class="caps env-caps">${t('you_are_invited')}</p>
    <div class="envelope">
      <div class="env-back"></div>
      <div class="env-clip"><div class="env-letter">
        <p class="env-blessing">${tr(inv.blessing)}</p>
        <p class="env-dear">${t('letter_dear')}</p>
        <p class="env-line">${tr(inv.line)}</p>
        <p class="env-names">${tr(config.couple.names)}</p>
        <p class="env-hosts">${tr(inv.hosts)}</p>
        <p class="env-sign">${tr(inv.signoff)}</p>
      </div></div>
      <div class="env-front"></div>
      <div class="env-flap"></div>
      <button type="button" class="env-seal" aria-label="${t('open_invite')}">${seal(config.couple.monogram)}</button>
    </div>
    <p class="env-hint">${t('tap_seal')}</p>
    <button type="button" class="btn btn-primary env-enter">${t('enter_site')}</button>
  </div>
  <button type="button" class="env-skip">${t('skip_invite')}</button>
</div>`;
}

// Photo-stage hero: crossfading slideshow behind the names, as on the invitation site
function hero(c) {
  const { config, t, tr } = c;
  const slides = config.photos.hero;
  return html`
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-frame" data-slideshow>
    ${slides.map((p, i) => html`<div class="slide${i === 0 ? ' on' : ''}"><img ${i === 0 ? html`src="${p.src}" fetchpriority="high"` : html`data-src="${p.src}"`} alt="${tr(p.alt)}" decoding="async"></div>`)}
    <div class="side-curtain l" aria-hidden="true"></div><div class="side-curtain r" aria-hidden="true"></div>
    <div class="hero-top">
      <p class="caps">${tr(config.invitation.blessing)}</p>
      <h1 id="hero-title" class="hero-names"><span class="n1">${tr(config.couple.partner1)}</span><span class="amp">&amp;</span><span class="n2">${tr(config.couple.partner2)}</span></h1>
    </div>
    <div class="hero-bottom">
      <p class="hero-invite">${t('hero_invite')}</p>
      <p class="hero-date">${tr(config.dateRange)}</p>
      <p class="hero-venue">${tr(config.venues[c.mainEvent.venue].name)}, ${tr(config.city)}</p>
    </div>
    <div class="dots" aria-hidden="true">${slides.map((_, i) => html`<i class="${i === 0 ? 'on' : ''}"></i>`)}</div>
  </div>
</section>`;
}

function countdown(c) {
  const { t, tr, now } = c;
  const main = c.mainEvent;
  const cd = countdownParts(main.start, now);
  return html`
<section class="countdown-wrap container" aria-label="${t('countdown_to', { event: tr(main.name) })}">
  <p class="countdown-label">${t('countdown_to', { event: tr(main.name) })}</p>
  <div class="countdown" data-countdown="${main.start}" role="timer">
    ${[['d', cd.d, 'days'], ['h', cd.h, 'hours'], ['m', cd.m, 'minutes'], ['s', cd.s, 'seconds']].map(([u, v, k]) => html`<div class="cd-unit"><span data-unit="${u}">${String(v).padStart(2, '0')}</span><small>${t(k)}</small></div>`)}
  </div>
  ${diya}
  <p class="hero-tag">${c.config.hashtag}</p>
  <div class="hero-actions">
    <a class="btn btn-primary btn-lg" href="/rsvp">${icon('rsvp')}<span>${t('rsvp_cta')}</span></a>
    <a class="btn btn-ghost" href="/events">${icon('calendar')}<span>${t('all_events')}</span></a>
  </div>
  <button type="button" class="link-btn replay-invite" hidden>${t('replay_invite')}</button>
</section>`;
}

export function venueBlock(c) {
  const { t, tr, config } = c;
  const v = config.venues[c.mainEvent.venue];
  const p = config.photos.venue;
  return html`
<section class="where" aria-labelledby="where-h">
  <h2 id="where-h" class="sec-title">${t('where_title')}</h2>
  <a class="arch" href="${v.mapsUrl}" target="_blank" rel="noopener" aria-label="${t('open_maps')}: ${tr(v.name)}">
    <img src="${p.src}" alt="${tr(p.alt)}" loading="lazy" decoding="async" width="546" height="820">
    <span class="tag"><span>${t('tap_directions')}</span></span>
  </a>
  <p class="venue-name">${tr(v.name)}</p>
  <p class="venue-addr"><span data-copy-text>${tr(v.address)}</span></p>
  <div class="dir-row">
    <a class="btn btn-primary" href="${v.directionsUrl || v.mapsUrl}" target="_blank" rel="noopener">${icon('pin')}<span>${t('directions')}</span></a>
    <button type="button" class="btn btn-line" data-copy>${t('copy_address')}</button>
  </div>
</section>`;
}

export function momentsReel(c) {
  const { t, tr, config } = c;
  return html`
<section class="moments" aria-labelledby="mom-h">
  <h2 id="mom-h" class="sec-title">${t('moments')}</h2>
  <p class="sec-sub">${t('moments_sub')}</p>
  <ul class="reel" data-lightbox>
    ${config.story.gallery.map((p, i) => html`<li><a class="polaroid" href="${p.src}" data-index="${i}"><img src="${p.thumb}" alt="${tr(p.alt)}" loading="lazy" decoding="async" width="480" height="600"><span>${tr(p.caption)}</span></a></li>`)}
  </ul>
  <p class="caps center muted">← ${t('swipe')} →</p>
</section>`;
}

function finale(c) {
  const { t, tr, config } = c;
  const p = config.photos.finale;
  return html`
<div class="finale">
  <img src="${p.src}" alt="${tr(p.alt)}" loading="lazy" decoding="async" width="546" height="820">
  <div><p class="a">${t('presence_blessing')}</p><p class="b">${t('see_you')}</p></div>
</div>`;
}

export function homePage(c, { events, liveEvent, upNext }) {
  const { t, tr } = c;
  const links = [
    ['/style', 'nav_style', 'style'], ['/travel', 'nav_travel', 'plane'], ['/story', 'nav_story', 'heart'],
    ['/family', 'nav_family', 'family'],
  ].filter(Boolean);

  const body = html`
${c.mode !== 'thankyou' ? envelope(c) : ''}
${hero(c)}
${c.mode === 'upcoming' ? countdown(c) : ''}
<div class="container">
  ${liveEvent ? html`<p class="live-banner" ${eventStyle(liveEvent)}>${icon(liveEvent.icon)} ${t('happening_now', { event: tr(liveEvent.name) })}</p>`
    : upNext && c.mode === 'live' ? html`<p class="live-banner" ${eventStyle(upNext)}>${icon(upNext.icon)} ${t('up_next', { event: tr(upNext.name) })}</p>` : ''}
</div>
${rsvpOpen(c.mode) ? rsvpBanner(c) : ''}
${programmeCard(c, events, { link: true })}
${venueBlock(c)}
${momentsReel(c)}
<div class="container">
  <section aria-labelledby="plan">
    <h2 id="plan" class="sec-title">${t('quick_links')}</h2>
    <ul class="tile-grid">
      ${links.map(([href, key, ic]) => html`<li><a class="tile" href="${href}">${icon(ic, 'icon icon-lg')}<span>${t(key)}</span></a></li>`)}
    </ul>
  </section>
  <section aria-labelledby="queries">
    <h2 id="queries" class="sec-title">${t('queries')}</h2>
    ${contactsCard(c)}
  </section>
  <p class="center"><a class="btn btn-whatsapp" href="${shareUrl(c)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${t('share_whatsapp')}</span></a></p>
</div>
${finale(c)}`;
  return layout(c, { body, page: 'home' });
}

export function thankYouPage(c, { photos, photosQr }) {
  const { config, t, tr } = c;
  const link = config.thankYou.photosLink;
  const video = config.thankYou.videoEmbed;
  const body = html`
<section class="hero hero-thanks" aria-labelledby="ty-title">
  <div class="hero-bg" aria-hidden="true">${mandala('hero-mandala')}</div>
  <p class="caps">${tr(config.invitation.blessing)}</p>
  <h1 id="ty-title" class="hero-names">${t('thankyou_title')}</h1>
  <p class="hero-line">${tr(config.thankYou.message)}</p>
  <span class="gold">${divider}</span>
  <p class="hero-date">${tr(config.couple.names)} · ${config.hashtag}</p>
</section>
<div class="container">
  <section aria-labelledby="hl">
    <h2 id="hl" class="sec-title">${t('highlights')}</h2>
    ${video
      ? html`<div class="video-facade" data-embed="${video}"><button type="button" class="btn btn-primary">${icon('play')}<span>${t('play_video')}</span></button></div>`
      : html`<p class="note center">${t('video_soon')}</p>`}
  </section>
  <section aria-labelledby="bp">
    <h2 id="bp" class="sec-title">${t('best_photos')}</h2>
    <ul class="gallery" data-lightbox>
      ${photos.map((p, i) => html`<li><a class="polaroid" href="${p.full}" data-index="${i}"><img src="${p.thumb}" alt="${p.alt}" loading="lazy" decoding="async"></a></li>`)}
    </ul>
  </section>
  ${link?.url ? html`<section class="card center" aria-labelledby="official">
    <h2 id="official">${tr(link.label)}</h2>
    <p><a class="btn btn-primary" href="${link.url}" target="_blank" rel="noopener">${icon('camera')}<span>${t('external_photos')}</span></a></p>
    ${photosQr ? html`<figure class="small-qr">${raw(photosQr)}<figcaption class="muted small">${t('scan_to_open')}</figcaption></figure>` : ''}
  </section>` : ''}
</div>
${finale(c)}`;
  return layout(c, { body, page: 'thankyou', title: t('thankyou_title') });
}

export function notFoundPage(c, message) {
  const body = html`<div class="container narrow">${pageHead(c.t('not_found'), message || c.t('not_found_body'))}<p class="center"><a class="btn btn-primary" href="/">${c.t('go_home')}</a></p></div>`;
  return layout(c, { body, page: 'error', title: c.t('not_found'), noindex: true });
}
