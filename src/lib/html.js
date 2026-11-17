// Tiny auto-escaping template helper: html`<p>${userText}</p>` escapes values;
// nest html`` results or wrap trusted markup in raw() to skip escaping.

class Safe {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

export const raw = (s) => new Safe(String(s ?? ''));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

function render(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Safe) return v.s;
  if (Array.isArray(v)) return v.map(render).join('');
  return escape(v);
}

export function html(strings, ...vals) {
  let out = strings[0];
  for (let i = 0; i < vals.length; i++) out += render(vals[i]) + strings[i + 1];
  return new Safe(out);
}

// JSON safe to embed inside <script type="application/json">
export const jsonForScript = (obj) =>
  raw(JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026'));
