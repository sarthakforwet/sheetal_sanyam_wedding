// RSVP by WhatsApp: easy to find, validated, and turned into a WhatsApp message.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, AFTER_WEDDING } from './helpers.js';

const form = (fields) => {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) for (const x of [].concat(v)) body.append(k, x);
  return { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
};
const waText = (res) => {
  const url = new URL(res.headers.get('location'));
  assert.equal(url.origin + url.pathname, 'https://api.whatsapp.com/send');
  assert.equal(url.searchParams.get('phone'), '919406623152');
  return url.searchParams.get('text');
};

describe('RSVP', () => {
  let t;
  before(async () => { t = await startApp(); });
  after(() => t.close());

  test('is linked from the hero, a home banner, the bottom bar and the footer', async () => {
    const html = await (await t.request('/')).text();
    assert.ok((html.match(/href="\/rsvp"/g) || []).length >= 4);
    assert.match(html, /class="rsvp-banner"/);
    assert.match(html, /class="nav-rsvp"/);
    for (const p of ['/events', '/story']) assert.match(await (await t.request(p)).text(), /class="nav-rsvp"/, p);
  });

  test('the form lists every function, all ticked, in both languages', async () => {
    const html = await (await t.request('/rsvp')).text();
    assert.match(html, /Are you attending\?/);
    assert.equal((html.match(/name="events" value="\w+"[^>]*checked/g) || []).length, 6);
    const hi = await (await t.request('/rsvp', { cookie: 'lang=hi' })).text();
    assert.match(hi, /क्या आप आ रहे हैं\?/);
  });

  test('a yes opens WhatsApp with the details', async () => {
    const res = await t.request('/rsvp', form({
      name: 'Anita Sharma', phone: '+91 98765 43210', city: 'Jaipur', attending: 'yes', count: '3',
      members: 'Rohit, Meera', events: ['haldi', 'sangeet', 'bhaat', 'reception'], arrival: '2026-12-01', time: '18:30', message: 'Congratulations!',
    }));
    assert.equal(res.status, 303);
    const text = waText(res);
    assert.ok(text.startsWith('Namaste 🙏\n'), 'emoji survives');
    assert.match(res.headers.get('location'), /%F0%9F%99%8F/);
    assert.match(text, /Name: Anita Sharma/);
    assert.match(text, /Attending: Yes/);
    assert.match(text, /Total guests: 3/);
    assert.match(text, /Family members: Rohit, Meera/);
    assert.match(text, /2 Dec: Haldi Carnival, Sangeet Night/);
    assert.match(text, /3 Dec: Bhaat, Reception & Dinner/);
    assert.match(text, /Arriving: 1 Dec, 6:30\spm/i);
    assert.match(text, /Wishes: Congratulations!/);
  });

  test('a no needs only a name and skips the details', async () => {
    const text = waText(await t.request('/rsvp', form({ name: 'Vikram', attending: 'no', count: '0' })));
    assert.match(text, /Attending: Sorry, cannot attend/);
    assert.doesNotMatch(text, /Total guests|Arriving/);
  });

  test('missing fields re-show the form with errors and keep what was typed', async () => {
    const res = await t.request('/rsvp', form({ name: ' ', attending: 'yes', count: '0', city: 'Bhopal' }));
    assert.equal(res.status, 422);
    const html = await res.text();
    assert.match(html, /Please enter your name/);
    assert.match(html, /Please enter the number of guests/);
    assert.match(html, /Please pick at least one function/);
    assert.match(html, /value="Bhopal"/);
  });

  test('ignores unknown functions and escapes what guests type', async () => {
    const res = await t.request('/rsvp', form({ name: '<script>x</script>', attending: 'yes', count: '1', events: ['nope'] }));
    assert.equal(res.status, 422);
    const html = await res.text();
    assert.ok(!html.includes('<script>x</script>'));
    assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
  });

  test('cross-site posts are refused', async () => {
    const res = await t.request('/rsvp', { ...form({ name: 'X', attending: 'no' }), headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' } });
    assert.equal(res.status, 403);
  });
});

describe('RSVP after the wedding', () => {
  let t;
  before(async () => { t = await startApp({ now: AFTER_WEDDING }); });
  after(() => t.close());

  test('is closed and no longer linked', async () => {
    assert.match(await (await t.request('/rsvp')).text(), /RSVPs are closed now/);
    assert.equal((await t.request('/rsvp', form({ name: 'Late', attending: 'no' }))).status, 403);
    assert.ok(!(await (await t.request('/')).text()).includes('href="/rsvp"'));
  });
});
