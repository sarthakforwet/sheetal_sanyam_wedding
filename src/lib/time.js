// Date formatting in the wedding's timezone, for both languages.

const TZ = 'Asia/Kolkata';
const LOCALE = { en: 'en-IN', hi: 'hi-IN' };

const fmt = (lang, opts) => new Intl.DateTimeFormat(LOCALE[lang] || 'en-IN', { timeZone: TZ, ...opts });

export const fmtDate = (iso, lang = 'en') =>
  fmt(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));

export const fmtShortDate = (iso, lang = 'en') =>
  fmt(lang, { day: 'numeric', month: 'short' }).format(new Date(iso));

export const fmtTime = (iso, lang = 'en') =>
  fmt(lang, { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso));

export const fmtTimeRange = (start, end, lang = 'en') => `${fmtTime(start, lang)} – ${fmtTime(end, lang)}`;

export const fmtDateTime = (iso, lang = 'en') =>
  fmt(lang, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso));

// YYYY-MM-DD for a timestamp, in IST
export const istDay = (iso) => fmt('en', { year: 'numeric', month: '2-digit', day: '2-digit' })
  .formatToParts(new Date(iso))
  .reduce((acc, p) => (p.type === 'literal' ? acc : { ...acc, [p.type]: p.value }), {});

export const istDateKey = (iso) => {
  const p = istDay(iso);
  return `${p.year}-${p.month}-${p.day}`;
};
