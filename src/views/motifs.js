// Inline SVG line-art: mandala, dividers, the wax seal, and a compact icon set.
// Everything draws with currentColor so CSS controls the palette.

import { raw } from '../lib/html.js';

// A generated line-art mandala: rings of petals, built once per size.
const mandalaCache = new Map();
export function mandala(cls = 'mandala') {
  if (mandalaCache.has(cls)) return mandalaCache.get(cls);
  const petals = (n, r, len, w) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      d += `<path transform="rotate(${(360 / n) * i} 100 100)" d="M100 ${100 - r} q ${w} ${-len / 2} 0 ${-len} q ${-w} ${len / 2} 0 ${len}z"/>`;
    }
    return d;
  };
  const dots = (n, r) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = ((Math.PI * 2) / n) * i;
      d += `<circle cx="${(100 + r * Math.cos(a)).toFixed(2)}" cy="${(100 + r * Math.sin(a)).toFixed(2)}" r="1.1"/>`;
    }
    return d;
  };
  const svg = raw(`<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width=".6">
<circle cx="100" cy="100" r="8"/><circle cx="100" cy="100" r="14"/>${petals(8, 14, 16, 6)}<circle cx="100" cy="100" r="34"/>
${petals(16, 34, 20, 5)}<circle cx="100" cy="100" r="58"/>${petals(24, 58, 18, 4)}<circle cx="100" cy="100" r="80"/>
${petals(32, 80, 14, 3)}<circle cx="100" cy="100" r="96"/></g><g fill="currentColor">${dots(24, 46)}${dots(48, 88)}</g></svg>`);
  mandalaCache.set(cls, svg);
  return svg;
}

export const divider = raw(`<svg class="divider" viewBox="0 0 240 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M0 12h92M148 12h92"/><path d="M120 3l9 9-9 9-9-9z"/><path d="M104 12l-6-5v10zM136 12l6-5v10z" fill="currentColor"/><circle cx="120" cy="12" r="2.5" fill="currentColor"/></g></svg>`);

// Floral corner flourish for cards
export const corner = raw(`<svg class="corner" viewBox="0 0 60 60" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width=".8"><path d="M2 58V20Q2 2 20 2h38"/><path d="M8 58V24Q8 8 24 8h34"/><path d="M14 22q6-8 14-8M22 14q-2 8 4 12M14 22q8 2 12-4"/><circle cx="22" cy="22" r="2"/></g></svg>`);

export const seal = (monogram) => raw(`<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
<defs><radialGradient id="wax" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#F3D99B"/><stop offset=".55" stop-color="#C49A4C"/><stop offset="1" stop-color="#8A6224"/></radialGradient></defs>
<path fill="url(#wax)" d="M60 4c8 0 10 6 17 8s14-1 18 5 1 12 4 18 9 9 9 17-6 10-8 17 1 14-5 18-12 1-18 4-9 9-17 9-10-6-17-8-14 1-18-5-1-12-4-18-9-9-9-17 6-10 8-17-1-14 5-18 12-1 18-4S52 4 60 4z"/>
<circle cx="60" cy="60" r="38" fill="none" stroke="#4A1418" stroke-opacity=".35" stroke-width="1.2"/>
<circle cx="60" cy="60" r="33" fill="none" stroke="#4A1418" stroke-opacity=".25" stroke-width=".8" stroke-dasharray="2 3"/>
<text x="60" y="70" text-anchor="middle" font-family="Amp, Playfair Display, Georgia, serif" font-size="28" font-weight="700" fill="#4A1418">${monogram.replace(/&/g, '&amp;')}</text></svg>`);

export const diya = raw(`<svg class="diya" viewBox="0 0 64 48" aria-hidden="true" focusable="false"><path class="diya-flame" d="M32 4c5 8 7 13 0 20-7-7-5-12 0-20z" fill="#F2A93B"/><path d="M32 10c2 5 3 8 0 12-3-4-2-7 0-12z" fill="#FFE29A"/><path d="M6 26h52c-2 12-12 18-26 18S8 38 6 26z" fill="currentColor"/><path d="M14 30h36" stroke="#E7C98F" stroke-width="1.2" stroke-dasharray="2 3"/></svg>`);

const ICONS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  rsvp: '<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>',
  ticket: '<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  style: '<path d="M8 3l4 3 4-3 5 4-3 4-2-1v11H8V10l-2 1-3-4z"/>',
  plane: '<path d="M10 14l-7-3 1-2 9 1 5-6c1-1 3-1 3 1l-1 3-5 6 1 9-2 1-3-7-4 1v3H6l-1-4z"/>',
  heart: '<path d="M12 20s-8-5-8-11a4 4 0 018-1 4 4 0 018 1c0 6-8 11-8 11z"/>',
  family: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-4 3-7 6-7s6 3 6 7M13 20c0-3 2-6 4-6s4 3 4 6"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2-4-7-4-6-1s6 1 6 1zm0 0c2-4 7-4 6-1s-6 1-6 1z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="4"/>',
  pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
  mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  chat: '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 10h8M8 13h5"/>',
  send: '<path d="M4 12l16-8-6 16-2-6z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 13h2M3 10h18"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  upload: '<path d="M12 16V5M7 10l5-5 5 5M5 20h14"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .8a5 5 0 01-2.3-2.3l.8-1-1-2z"/>',
  // event motifs
  haldi: '<path d="M3 13h18a9 9 0 01-18 0z"/><path d="M8 13c0-3 2-5 4-5s4 2 4 5"/><path d="M12 8V4M9 5l1 2M15 5l-1 2"/>',
  sangeet: '<ellipse cx="12" cy="7" rx="8" ry="3"/><path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7"/><path d="M6 9l4 9M18 9l-4 9"/>',
  baraat: '<path d="M12 3v3"/><path d="M4 12a8 6 0 0116 0z"/><path d="M12 12v9M8 21h8"/><path d="M4 12l-1 2M20 12l1 2M8 12l-.5 2M16 12l.5 2"/>',
  wedding: '<path d="M5 20h14l-2-6H7z"/><path d="M12 14c-3-2-3-5 0-9 3 4 3 7 0 9z"/><path d="M9 14c-1-1-1-3 0-4M15 14c1-1 1-3 0-4"/>',
  reception: '<path d="M7 3h4l-.5 6a1.5 1.5 0 01-3 0z"/><path d="M9 11v8M6 21h6"/><path d="M14 3h4l-.5 6a1.5 1.5 0 01-3 0z"/><path d="M16 11v8M13 21h6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  ring: '<circle cx="12" cy="15" r="6"/><path d="M9 6l3-3 3 3-3 3z"/>',
  pot: '<path d="M9 4h6M10 4v2a6 6 0 00-5 6 7 7 0 0014 0 6 6 0 00-5-6V4"/><path d="M6 13h12"/>',
};

export const icon = (name, cls = 'icon') =>
  raw(`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`);

// Fabric-pattern tile for dress-code mood boards (no stock photos needed)
const PATTERNS = [
  // bandhani dots
  (c) => `<pattern id="p{id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${c[0]}"/><circle cx="3.5" cy="3.5" r="1.6" fill="${c[3]}"/><circle cx="10.5" cy="10.5" r="1.6" fill="${c[3]}"/><circle cx="10.5" cy="3.5" r=".9" fill="${c[2]}"/><circle cx="3.5" cy="10.5" r=".9" fill="${c[2]}"/></pattern>`,
  // leheriya waves
  (c) => `<pattern id="p{id}" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="24" height="24" fill="${c[1]}"/><path d="M0 6q6-4 12 0t12 0M0 18q6-4 12 0t12 0" stroke="${c[3]}" stroke-width="2.5" fill="none"/><path d="M0 12q6-4 12 0t12 0" stroke="${c[0]}" stroke-width="2" fill="none"/></pattern>`,
  // brocade buti
  (c) => `<pattern id="p{id}" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="${c[4] || c[0]}"/><path d="M14 6q4 4 0 9-4-5 0-9zM14 15v5" stroke="${c[2]}" stroke-width="1.1" fill="${c[1]}" fill-opacity=".6"/><circle cx="0" cy="0" r="1.4" fill="${c[2]}"/><circle cx="28" cy="28" r="1.4" fill="${c[2]}"/><circle cx="28" cy="0" r="1.4" fill="${c[2]}"/><circle cx="0" cy="28" r="1.4" fill="${c[2]}"/></pattern>`,
  // block-print jaal
  (c) => `<pattern id="p{id}" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${c[3]}"/><path d="M10 0l10 10-10 10L0 10z" fill="none" stroke="${c[0]}" stroke-width="1.2"/><circle cx="10" cy="10" r="2.2" fill="${c[1]}"/></pattern>`,
];
export function fabricTile(palette, variant, id) {
  const c = [...palette, ...palette];
  const def = PATTERNS[variant % PATTERNS.length](c).replace('{id}', id);
  return raw(`<svg class="fabric" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${def}</defs><rect width="120" height="120" fill="url(#p${id})"/></svg>`);
}
