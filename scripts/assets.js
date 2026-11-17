// Generates the WhatsApp/Open Graph preview image, app icons and favicon.
// Runs automatically at startup for anything missing; `npm run og`
// regenerates everything (e.g. after changing names or config.photos.og).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import config from '../config/wedding.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const IMG = path.join(PUB, 'img');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS = "Poppins, 'Segoe UI', Arial, sans-serif";
const GOLD = `<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D99B"/><stop offset=".5" stop-color="#D8B56E"/><stop offset="1" stop-color="#A87E36"/></linearGradient>`;

const sealSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">
<defs><radialGradient id="w" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#F3D99B"/><stop offset=".55" stop-color="#C49A4C"/><stop offset="1" stop-color="#8A6224"/></radialGradient></defs>
<rect width="120" height="120" rx="26" fill="#170406"/>
<circle cx="60" cy="60" r="50" fill="url(#w)"/>
<circle cx="60" cy="60" r="41" fill="none" stroke="#4A1418" stroke-opacity=".35" stroke-width="1.5"/>
<text x="60" y="70" text-anchor="middle" font-family="${SERIF}" font-size="30" font-weight="700" fill="#4A1418">${esc(config.couple.monogram)}</text></svg>`;

// 1200×630: velvet background, couple photo in an arch, names in gold
async function ogImage() {
  const W = 1200, H = 630;
  const photo = config.photos?.og ? path.join(PUB, config.photos.og.replace(/^\//, '')) : null;
  const hasPhoto = photo && fs.existsSync(photo);
  const textX = hasPhoto ? 790 : W / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>${GOLD}<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#5B0A12"/><stop offset="1" stop-color="#170406"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="#D8B56E" stroke-opacity=".6" stroke-width="2"/>
  <rect x="32" y="32" width="${W - 64}" height="${H - 64}" fill="none" stroke="#D8B56E" stroke-opacity=".25" stroke-width="1"/>
  <text x="${textX}" y="150" text-anchor="middle" font-family="${SANS}" font-size="22" letter-spacing="6" fill="#CDB596">YOU ARE INVITED</text>
  <text x="${textX}" y="262" text-anchor="middle" font-family="${SERIF}" font-size="${hasPhoto ? 88 : 110}" font-weight="600" fill="url(#gold)">${esc(config.couple.partner1.en)}</text>
  <text x="${textX}" y="322" text-anchor="middle" font-family="${SERIF}" font-size="44" fill="#D8B56E">weds</text>
  <text x="${textX}" y="418" text-anchor="middle" font-family="${SERIF}" font-size="${hasPhoto ? 88 : 110}" font-weight="600" fill="url(#gold)">${esc(config.couple.partner2.en)}</text>
  <text x="${textX}" y="492" text-anchor="middle" font-family="${SERIF}" font-size="32" fill="#F3E6CF">${esc(config.dateRange.en)}</text>
  <text x="${textX}" y="540" text-anchor="middle" font-family="${SANS}" font-size="22" fill="#CDB596">${esc(Object.values(config.venues)[0].name.en)}, ${esc(config.city.en)}</text>
</svg>`;
  let img = sharp(Buffer.from(svg));
  if (hasPhoto) {
    // Arched (jharokha-style) couple photo on the left, with a gold frame
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="380" height="520"><path d="M0 520V190C0 85 85 0 190 0s190 85 190 190v330z" fill="#fff"/></svg>`);
    const cut = await sharp(photo).resize(380, 520, { fit: 'cover', position: 'attention' }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
    const frame = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="404" height="544"><path d="M12 532V202C12 97 97 12 202 12s190 85 190 190v330z" fill="none" stroke="#D8B56E" stroke-width="3"/></svg>`);
    img = img.composite([{ input: cut, left: 110, top: 55 }, { input: frame, left: 98, top: 43 }]);
  }
  await img.png({ compressionLevel: 9 }).toFile(path.join(PUB, 'og.png'));
}

export async function ensureAssets({ force = false } = {}) {
  fs.mkdirSync(IMG, { recursive: true });
  const need = (p) => force || !fs.existsSync(p);
  if (need(path.join(PUB, 'og.png'))) await ogImage();
  for (const size of [192, 512]) {
    const p = path.join(IMG, `icon-${size}.png`);
    if (need(p)) await sharp(Buffer.from(sealSvg(size))).png().toFile(p);
  }
  const fav = path.join(IMG, 'favicon.svg');
  if (need(fav)) fs.writeFileSync(fav, sealSvg(64));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await ensureAssets({ force: process.argv.includes('--force') });
  console.log('Assets generated in public/.');
}
