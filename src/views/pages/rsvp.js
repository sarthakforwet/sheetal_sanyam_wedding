// RSVP form. Submitting it opens WhatsApp with a prefilled message to the family.

import { html, raw } from '../../lib/html.js';
import { layout } from '../layout.js';
import { icon } from '../motifs.js';
import { pageHead, eventStyle } from '../components.js';
import { fmtDate, fmtShortDate, fmtTime } from '../../lib/time.js';
import { programme } from '../../lib/visibility.js';
import { ARRIVAL_DAYS } from '../../lib/rsvp.js';

const prettyNumber = (n) => {
  const d = n.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
};

// Eye-catching invitation to RSVP, used on the home page
export function rsvpBanner(c) {
  const { t } = c;
  return html`
<section class="rsvp-banner" aria-labelledby="rsvp-banner-h">
  <div class="rsvp-banner-inner">
    ${icon('rsvp', 'icon icon-lg')}
    <h2 id="rsvp-banner-h">${t('rsvp_banner_title')}</h2>
    <p>${t('rsvp_banner_text')}</p>
    <a class="btn btn-primary btn-lg" href="/rsvp">${icon('rsvp')}<span>${t('rsvp_cta')}</span></a>
  </div>
</section>`;
}

export function rsvpPage(c, { events, values = null, errors = {}, open = true }) {
  const { t, tr, lang, config } = c;
  if (!open) {
    const body = html`<div class="container narrow">${pageHead(t('rsvp_title'))}<p class="note center">${t('rsvp_closed')}</p></div>`;
    return layout(c, { body, page: 'rsvp', title: t('nav_rsvp') });
  }
  const v = values || { attending: 'yes', count: 1, events: events.map((e) => e.id) };
  const chosen = new Set(v.events || []);
  const has = (k) => !!errors[k];
  const err = (k, key) => (has(k) ? html`<p class="field-error" id="err-${k}">${t(key)}</p>` : '');
  const invalid = (k) => (has(k) ? raw(`aria-invalid="true" aria-describedby="err-${k}"`) : '');
  const days = programme(config, events).map((d) => ({ ...d, items: d.items.filter((i) => i.event) }));

  const body = html`
<div class="container narrow">
  ${pageHead(t('rsvp_title'), t('rsvp_intro'))}
  <form class="card rsvp-card" method="post" action="/rsvp" novalidate data-rsvp>
    ${Object.keys(errors).length ? html`<p class="rsvp-alert" role="alert">${t('rsvp_err_form')}</p>` : ''}

    <div class="field">
      <label for="rsvp-name">${t('rsvp_name')} *</label>
      <input id="rsvp-name" name="name" autocomplete="name" maxlength="80" required value="${v.name || ''}" ${invalid('name')}>
      ${err('name', 'rsvp_err_name')}
    </div>
    <div class="row-2">
      <div class="field"><label for="rsvp-phone">${t('rsvp_phone')}</label><input id="rsvp-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="${v.phone || ''}"></div>
      <div class="field"><label for="rsvp-city">${t('rsvp_city')}</label><input id="rsvp-city" name="city" autocomplete="address-level2" maxlength="60" value="${v.city || ''}"></div>
    </div>

    <fieldset class="field">
      <legend class="label">${t('rsvp_attending')}</legend>
      <div class="seg">
        <label><input type="radio" name="attending" value="yes" ${v.attending !== 'no' ? raw('checked') : ''}><span>${t('rsvp_yes')}</span></label>
        <label><input type="radio" name="attending" value="no" ${v.attending === 'no' ? raw('checked') : ''}><span>${t('rsvp_no')}</span></label>
      </div>
    </fieldset>

    <div class="yes-only">
      <div class="field">
        <label for="rsvp-count">${t('rsvp_count')}</label>
        <div class="stepper">
          <button type="button" class="step" data-step="-1" aria-label="−1" hidden>−</button>
          <input id="rsvp-count" name="count" type="number" inputmode="numeric" min="1" max="30" value="${v.count || 1}" ${invalid('count')}>
          <button type="button" class="step" data-step="1" aria-label="+1" hidden>+</button>
        </div>
        ${err('count', 'rsvp_err_count')}
      </div>
      <div class="field">
        <label for="rsvp-members">${t('rsvp_members')}</label>
        <textarea id="rsvp-members" name="members" rows="2" maxlength="400">${v.members || ''}</textarea>
      </div>

      <fieldset class="field rsvp-events" ${invalid('events')}>
        <legend class="label">${t('rsvp_functions')}</legend>
        <div class="quick" hidden>
          <button type="button" class="link-btn" data-pick="all">${t('rsvp_select_all')}</button>
          ${days.map((d) => html`<button type="button" class="link-btn" data-pick="${d.date}">${t('rsvp_only_day', { day: fmtShortDate(`${d.date}T12:00:00+05:30`, lang) })}</button>`)}
        </div>
        ${days.map((d) => html`
        <p class="rsvp-day">${fmtDate(`${d.date}T12:00:00+05:30`, lang)}</p>
        ${d.items.map((it) => html`<label class="check" ${eventStyle(it.event)}><input type="checkbox" name="events" value="${it.event.id}" data-day="${d.date}" ${chosen.has(it.event.id) ? raw('checked') : ''}><span>${tr(it.name)} <small class="muted">· ${fmtTime(it.time, lang)}</small></span></label>`)}`)}
        ${err('events', 'rsvp_err_events')}
      </fieldset>

      <div class="row-2">
        <div class="field">
          <label for="rsvp-arrival">${t('rsvp_arrival')}</label>
          <select id="rsvp-arrival" name="arrival">
            <option value="">${t('rsvp_arrival_none')}</option>
            <option value="local" ${v.arrivalDay === 'local' ? raw('selected') : ''}>${t('rsvp_arrival_local')}</option>
            ${ARRIVAL_DAYS.map((d) => html`<option value="${d}" ${v.arrivalDay === d ? raw('selected') : ''}>${fmtDate(`${d}T12:00:00+05:30`, lang)}</option>`)}
          </select>
        </div>
        <div class="field"><label for="rsvp-time">${t('rsvp_arrival_time')}</label><input id="rsvp-time" name="time" type="time" value="${v.arrivalTime || ''}"></div>
      </div>
    </div>

    <div class="field">
      <label for="rsvp-message">${t('rsvp_message')}</label>
      <textarea id="rsvp-message" name="message" rows="3" maxlength="500">${v.message || ''}</textarea>
    </div>

    <button class="btn btn-whatsapp btn-lg rsvp-send" type="submit">${icon('whatsapp')}<span>${t('rsvp_send')}</span></button>
    <p class="hint center">${t('rsvp_goes_to', { number: prettyNumber(config.rsvp.whatsapp) })}</p>
  </form>
</div>`;
  return layout(c, { body, page: 'rsvp', title: t('nav_rsvp') });
}
