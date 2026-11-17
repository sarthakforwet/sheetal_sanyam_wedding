// RSVP by WhatsApp. The form is validated here and turned into a formatted
// WhatsApp message to the family; nothing is stored on the server.

import { allEvents } from './visibility.js';
import { fmtShortDate, fmtTime } from './time.js';

export const ARRIVAL_DAYS = ['2026-12-01', '2026-12-02', '2026-12-03'];
const MAX_GUESTS = 30;

const str = (v, max) => (typeof v === 'string' ? v.trim().replace(/[ \t]+/g, ' ').slice(0, max) : '');
const list = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Normalise and check the submitted form. Returns { ok, value, errors }.
export function validateRsvp(input, config) {
  input = input || {};
  const errors = {};
  const ids = new Set(config.events.map((e) => e.id));

  const name = str(input.name, 80);
  if (!name) errors.name = 'name';
  const phone = str(input.phone, 20).replace(/[^\d+\s-]/g, '');
  const city = str(input.city, 60);
  const attending = input.attending === 'no' ? 'no' : 'yes';
  const message = typeof input.message === 'string' ? input.message.trim().replace(/\r\n?/g, '\n').slice(0, 500) : '';

  let count = 0;
  let members = '';
  let events = [];
  let arrivalDay = '';
  let arrivalTime = '';
  if (attending === 'yes') {
    count = Number.parseInt(input.count, 10);
    if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) errors.count = 'count';
    members = str(input.members, 400);
    events = list(input.events).filter((id) => ids.has(id));
    if (!events.length) errors.events = 'events';
    arrivalDay = input.arrival === 'local' || ARRIVAL_DAYS.includes(input.arrival) ? input.arrival : '';
    arrivalTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(input.time || '') && arrivalDay && arrivalDay !== 'local' ? input.time : '';
  }

  const value = { name, phone, city, attending, count, members, events, arrivalDay, arrivalTime, message };
  return { ok: Object.keys(errors).length === 0, value, errors };
}

// The WhatsApp message, in the visitor's language
export function rsvpMessage(value, { config, t, tr, lang }) {
  const L = [t('rsvp_msg_greeting'), `*${t('rsvp_msg_title', { names: tr(config.couple.names) })}*`, ''];
  L.push(`${t('rsvp_msg_name')}: ${value.name}`);
  if (value.phone) L.push(`${t('rsvp_msg_phone')}: ${value.phone}`);
  if (value.city) L.push(`${t('rsvp_msg_city')}: ${value.city}`);
  if (value.attending === 'no') {
    L.push(`${t('rsvp_msg_attending')}: ${t('rsvp_msg_no')}`);
  } else {
    L.push(`${t('rsvp_msg_attending')}: ${t('rsvp_msg_yes')}`);
    L.push(`${t('rsvp_msg_guests')}: ${value.count}`);
    if (value.members) L.push(`${t('rsvp_msg_members')}: ${value.members}`);
    const chosen = new Set(value.events);
    const byDay = new Map();
    for (const ev of allEvents(config).filter((e) => chosen.has(e.id))) {
      const day = fmtShortDate(ev.start, lang);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(tr(ev.name));
    }
    for (const [day, names] of byDay) L.push(`${day}: ${names.join(', ')}`);
    if (value.arrivalDay === 'local') L.push(`${t('rsvp_msg_arriving')}: ${t('rsvp_arrival_local')}`);
    else if (value.arrivalDay) {
      const when = fmtShortDate(`${value.arrivalDay}T12:00:00+05:30`, lang);
      const time = value.arrivalTime ? `, ${fmtTime(`${value.arrivalDay}T${value.arrivalTime}:00+05:30`, lang)}` : '';
      L.push(`${t('rsvp_msg_arriving')}: ${when}${time}`);
    }
  }
  if (value.message) L.push('', `${t('rsvp_msg_wishes')}: ${value.message}`);
  return L.join('\n');
}

// api.whatsapp.com rather than wa.me: wa.me's redirect turns emoji into "�"
export const whatsappUrl = (number, text) => `https://api.whatsapp.com/send?phone=${number.replace(/\D/g, '')}&text=${encodeURIComponent(text)}`;

export const rsvpOpen = (mode) => mode !== 'thankyou';
