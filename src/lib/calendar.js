// .ics generation and Google Calendar deep links.

const utc = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

// RFC 5545 line folding at 75 octets
function fold(line) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const out = [];
  let chunk = '';
  for (const ch of line) {
    if (Buffer.byteLength(chunk + ch) > (out.length ? 74 : 75)) {
      out.push(chunk);
      chunk = '';
    }
    chunk += ch;
  }
  out.push(chunk);
  return out.join('\r\n ');
}

function eventDetails(config, ev, tr) {
  const venue = config.venues[ev.venue];
  return {
    title: `${tr(ev.name)} · ${tr(config.couple.names)}`,
    location: `${tr(venue.name)}, ${tr(venue.address)}`,
    description: `${tr(ev.tagline)}\n${ev.dress ? `${tr(ev.dress.title)}: ${tr(ev.dress.note)}\n` : ''}\n${tr(ev.ritual)}\n\n${config.hashtag}`,
  };
}

export function buildIcs(config, events, { tr, host = 'wedding.local', now = Date.now() }) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sanyam & Sheetal//Wedding//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const ev of events) {
    const d = eventDetails(config, ev, tr);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.id}-${config.events.indexOf(ev)}@${host}`,
      `DTSTAMP:${utc(new Date(now).toISOString())}`,
      `DTSTART:${utc(ev.start)}`,
      `DTEND:${utc(ev.end)}`,
      `SUMMARY:${icsEscape(d.title)}`,
      `LOCATION:${icsEscape(d.location)}`,
      `DESCRIPTION:${icsEscape(d.description)}`,
      `URL:${config.venues[ev.venue].mapsUrl}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:-PT2H',
      `DESCRIPTION:${icsEscape(d.title)}`,
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function googleCalendarUrl(config, ev, tr) {
  const d = eventDetails(config, ev, tr);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: d.title,
    dates: `${utc(ev.start)}/${utc(ev.end)}`,
    details: d.description,
    location: d.location,
    ctz: config.timezone,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
