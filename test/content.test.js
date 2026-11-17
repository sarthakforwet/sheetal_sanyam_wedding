// Config & translation integrity, plus a render pass over every page in both languages.

import fs from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../config/wedding.js';
import i18n from '../config/i18n.js';
import { buildIcs } from '../src/lib/calendar.js';
import { startApp, AFTER_WEDDING } from './helpers.js';

test('English and Hindi interface strings have the same keys and placeholders', () => {
  const en = Object.keys(i18n.en).sort();
  const hi = Object.keys(i18n.hi).sort();
  assert.deepEqual(hi, en);
  for (const k of en) {
    const vars = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
    assert.equal(vars(i18n.hi[k]), vars(i18n.en[k]), `placeholders differ for ${k}`);
  }
});

test('every bilingual content field in the config has both languages', () => {
  const walk = (node, p) => {
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${p}[${i}]`));
    if (node && typeof node === 'object') {
      const keys = Object.keys(node);
      if (keys.includes('en') && keys.every((k) => k === 'en' || k === 'hi')) {
        assert.ok(node.en && node.hi, `${p} is missing a translation`);
        return;
      }
      for (const [k, v] of Object.entries(node)) walk(v, `${p}.${k}`);
    }
  };
  walk(config, 'config');
});

test('every configured photo exists on disk', () => {
  const p = config.photos;
  const all = [...p.hero, p.venue, p.finale, ...config.story.gallery, ...config.story.timeline.map((m) => ({ src: m.image }))];
  for (const ph of all) {
    for (const f of [ph.src, ph.thumb].filter(Boolean)) assert.ok(fs.existsSync(new URL(`../public${f}`, import.meta.url)), f);
  }
});

test('events reference real venues and have sane times', () => {
  for (const e of config.events) {
    assert.ok(config.venues[e.venue], `${e.id} venue`);
    assert.ok(Date.parse(e.end) > Date.parse(e.start), `${e.id} times`);
  }
  assert.ok(config.events.some((e) => e.id === config.mainEventId));
});

test('ICS output is valid-looking and folded', () => {
  const ics = buildIcs(config, config.events, { tr: (v) => (typeof v === 'object' ? v.en : v) });
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, config.events.length);
  assert.ok(ics.split('\r\n').every((l) => Buffer.byteLength(l) <= 75));
  assert.match(ics, /DTSTART:20261203T033000Z/, 'Baraat 9:00 IST = 03:30 UTC');
});

test('every page renders in both languages without leaking raw keys', async () => {
  const t = await startApp();
  try {
    for (const lang of ['en', 'hi']) {
      for (const p of ['/', '/events', '/style', '/travel', '/story', '/family']) {
        const res = await t.request(p, { cookie: `lang=${lang}` });
        assert.equal(res.status, 200, `${lang} ${p}`);
        const html = (await res.text()).replace(/<script type="application\/json"[\s\S]*?<\/script>/, '');
        assert.match(html, new RegExp(`<html lang="${lang}"`));
        const visible = html.replace(/<[^>]+>/g, ' ');
        const leaked = Object.keys(i18n.en).filter((k) => k.includes('_') && new RegExp(`(^|\\s)${k}(\\s|$)`).test(visible));
        assert.deepEqual(leaked, [], `${lang} ${p}`);
      }
    }
    t.clock.now = AFTER_WEDDING;
    assert.match(await (await t.request('/')).text(), /page-thankyou/);
  } finally {
    await t.close();
  }
});
