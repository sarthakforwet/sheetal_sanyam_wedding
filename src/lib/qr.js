// QR helpers: SVG for the page, PNG for downloads and printing.

import QRCode from 'qrcode';

// Wine on cream, matching the invitation palette (still high-contrast for scanners)
const DARK = '#2A0509';
const LIGHT = '#F5EBD9';

export const qrSvg = (text, { margin = 1, light = LIGHT } = {}) =>
  QRCode.toString(text, { type: 'svg', errorCorrectionLevel: 'M', margin, color: { dark: DARK, light } });

export const qrPng = (text, { width = 600, margin = 2, light = LIGHT } = {}) =>
  QRCode.toBuffer(text, { type: 'png', errorCorrectionLevel: 'M', width, margin, color: { dark: DARK, light } });
