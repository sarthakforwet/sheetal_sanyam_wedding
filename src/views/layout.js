// Page shell: <head> with Open Graph tags, header, bottom navigation, the
// "More" sheet, the concierge widget and the footer.

import { html, raw, jsonForScript } from '../lib/html.js';
import { icon, seal, mandala } from './motifs.js';
import { rsvpOpen } from '../lib/rsvp.js';

const FONTS = {
  en: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Poppins:wght@300;400;500;600&display=swap',
  hi: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Poppins:wght@300;400;500;600&family=Tiro+Devanagari+Hindi&family=Mukta:wght@400;500;600&display=swap',
};

// Strings the browser script needs
const CLIENT_KEYS = [
  'days', 'hours', 'minutes', 'seconds', 'music_play', 'music_pause', 'copied', 'copy', 'err_generic', 'err_rate',
  'concierge_thinking', 'concierge_error',
  'wx_clear', 'wx_mostly_clear', 'wx_partly_cloudy', 'wx_cloudy', 'wx_fog', 'wx_drizzle', 'wx_rain', 'wx_showers', 'wx_storm',
  'rain_chance', 'weather_typical', 'weather_forecast', 'lightbox_prev', 'lightbox_next', 'close',
];

export function navItems(c) {
  const all = [
    { href: '/', key: 'nav_home', icon: 'home' },
    rsvpOpen(c.mode) && { href: '/rsvp', key: 'nav_rsvp', icon: 'rsvp' },
    { href: '/events', key: 'nav_events', icon: 'calendar' },
    { href: '/style', key: 'nav_style', icon: 'style' },
    { href: '/travel', key: 'nav_travel', icon: 'plane' },
    { href: '/story', key: 'nav_story', icon: 'heart' },
    { href: '/family', key: 'nav_family', icon: 'family' },
  ];
  return all.filter(Boolean);
}

export function shareUrl(c) {
  const text = c.t('share_message', {
    names: c.tr(c.config.couple.names),
    dates: c.tr(c.config.dateRange),
    city: c.tr(c.config.city),
    hashtag: c.config.hashtag,
    url: c.baseUrl + '/',
  });
  // api.whatsapp.com rather than wa.me: wa.me's redirect turns emoji into "�"
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function layout(c, { title, body, page = '', noindex = false, description, bodyClass = '' }) {
  const { config, t, tr, lang } = c;
  const names = tr(config.couple.names);
  const fullTitle = title ? `${title} · ${names}` : `${names} · ${config.hashtag}`;
  const desc = description || `${tr(config.dateRange)} · ${tr(config.city)} · ${config.hashtag}`;
  const robots = noindex || !config.indexable ? 'noindex, nofollow' : 'index, follow';
  // RSVP sits in the middle of the bar, highlighted, until the wedding is over
  const bottom = rsvpOpen(c.mode)
    ? [['/', 'nav_home', 'home'], ['/events', 'nav_events', 'calendar'], ['/rsvp', 'nav_rsvp', 'rsvp'], ['/story', 'nav_story', 'heart']]
    : [['/', 'nav_home', 'home'], ['/events', 'nav_events', 'calendar'], ['/story', 'nav_story', 'heart'], ['/family', 'nav_family', 'family']];
  const isCurrent = (href) => (href === '/' ? c.path === '/' : c.path.startsWith(href));
  const otherLang = lang === 'en' ? 'hi' : 'en';
  const strings = Object.fromEntries(CLIENT_KEYS.map((k) => [k, t(k)]));

  return html`<!doctype html>
<html lang="${lang}" class="no-js${lang === 'hi' ? ' lang-hi' : ''}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#170406">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${names}">
<meta property="og:title" content="${tr(config.couple.partner1)} weds ${tr(config.couple.partner2)} · ${tr(config.dateRange)}">
<meta property="og:description" content="${tr(config.invitation.line)} · ${tr(config.city)} · ${config.hashtag}">
<meta property="og:url" content="${c.baseUrl}${c.path === '/' ? '/' : c.path}">
<meta property="og:image" content="${c.baseUrl}/og.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${names} — ${tr(config.dateRange)}">
<meta property="og:locale" content="${lang === 'hi' ? 'hi_IN' : 'en_IN'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/img/icon-192.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS[lang]}">
<link rel="stylesheet" href="/assets/site.css?v=${c.assetVersion}">
<script nonce="${c.nonce}">document.documentElement.classList.replace('no-js','js');try{if(${page === 'home' && c.mode !== 'thankyou' ? 'true' : 'false'}&&!/[?&]invite=0/.test(location.search)&&!localStorage.getItem('invite-opened'))document.documentElement.classList.add('show-invite')}catch(e){}</script>
<script src="/assets/site.js?v=${c.assetVersion}" defer></script>
</head>
<body class="page-${page} ${bodyClass}">
<a class="skip-link" href="#main">${t('skip_to_content')}</a>
<header class="topbar">
  <a class="brand" href="/" aria-label="${names} — ${t('nav_home')}">
    <span class="brand-mark">${raw(seal(config.couple.monogram))}</span>
    <span class="brand-text">${names}</span>
  </a>
  <div class="topbar-actions">
    <a class="pill-btn" href="/lang/${otherLang}?next=${encodeURIComponent(c.path)}" hreflang="${otherLang}" lang="${otherLang}" aria-label="${t('switch_lang_label')}">${icon('globe')}<span>${t('switch_lang')}</span></a>
    <button class="icon-btn music-toggle" type="button" aria-pressed="false" data-src="${config.music.src || ''}" aria-label="${t('music_play')}" hidden>${icon('mute', 'icon i-off')}${icon('sound', 'icon i-on')}</button>
  </div>
</header>

<main id="main" tabindex="-1">
${body}
</main>

<footer class="site-footer">
  ${mandala('footer-mandala')}
  <p class="footer-names">${names}</p>
  <p class="footer-tag">${config.hashtag}</p>
  <p class="footer-ctas">${rsvpOpen(c.mode) ? html`<a class="btn btn-primary" href="/rsvp">${icon('rsvp')}<span>${t('rsvp_cta')}</span></a>` : ''}<a class="btn btn-whatsapp" href="${shareUrl(c)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${t('share_whatsapp')}</span></a></p>
  <p class="footer-small">${t('made_with_love')}</p>
</footer>

<nav class="bottom-nav" aria-label="${t('nav_menu')}">
  ${bottom.map(([href, key, ic]) => html`<a href="${href}" ${href === '/rsvp' ? raw('class="nav-rsvp"') : ''} ${isCurrent(href) ? raw('aria-current="page"') : ''}>${href === '/rsvp' ? html`<span class="nav-rsvp-dot">${icon(ic)}</span>` : icon(ic)}<span>${t(key)}</span></a>`)}
  <button type="button" class="more-btn" aria-haspopup="dialog" aria-controls="more-sheet">${icon('menu')}<span>${t('nav_more')}</span></button>
</nav>

<dialog id="more-sheet" class="sheet" aria-label="${t('nav_menu')}">
  <div class="sheet-head"><strong>${t('nav_menu')}</strong><button type="button" class="icon-btn" data-close aria-label="${t('close')}">${icon('x')}</button></div>
  <ul class="sheet-links">
    ${navItems(c).map((n) => html`<li><a href="${n.href}" ${isCurrent(n.href) ? raw('aria-current="page"') : ''}>${icon(n.icon)}<span>${t(n.key)}</span>${icon('chevron', 'icon chev')}</a></li>`)}
  </ul>
</dialog>

${c.conciergeOn ? conciergeWidget(c) : ''}
<script type="application/json" id="i18n">${jsonForScript(strings)}</script>
</body>
</html>`;
}

function conciergeWidget(c) {
  const { t } = c;
  return html`<div class="concierge" data-concierge>
  <button type="button" class="concierge-fab" aria-haspopup="dialog" aria-controls="concierge-panel" aria-label="${t('concierge_open')}">${icon('chat')}</button>
  <dialog id="concierge-panel" class="concierge-panel" aria-labelledby="concierge-title">
    <div class="concierge-head"><strong id="concierge-title">${t('concierge')}</strong><button type="button" class="icon-btn" data-close aria-label="${t('close')}">${icon('x')}</button></div>
    <div class="concierge-log" role="log" aria-live="polite" aria-relevant="additions">
      <p class="msg msg-bot">${t('concierge_hello')}</p>
    </div>
    <div class="concierge-suggest">
      ${['concierge_suggest_1', 'concierge_suggest_2'].map((k) => html`<button type="button" class="chip" data-suggest>${t(k)}</button>`)}
    </div>
    <form class="concierge-form" autocomplete="off">
      <label class="sr-only" for="concierge-input">${t('concierge_placeholder')}</label>
      <input id="concierge-input" name="q" maxlength="500" placeholder="${t('concierge_placeholder')}" required>
      <button class="icon-btn send" type="submit" aria-label="${t('concierge_send')}">${icon('send')}</button>
    </form>
    <p class="concierge-foot"><a href="https://wa.me/${c.config.coordinator.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noopener">${icon('whatsapp')} ${t('whatsapp_coordinator', { name: c.tr(c.config.coordinator.name) })}</a></p>
  </dialog>
</div>`;
}
