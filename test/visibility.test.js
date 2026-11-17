import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import config from '../config/wedding.js';
import { allEvents, siteMode, nextEvent, mainEvent, dressFor, programme } from '../src/lib/visibility.js';

const ids = (evs) => evs.map((e) => e.id);

describe('schedule', () => {
  test('every function, in chronological order', () => {
    assert.deepEqual(ids(allEvents(config)), ['haldi', 'sagai', 'sangeet', 'bhaat', 'baraat', 'reception']);
  });

  test('the countdown points at the Baraat Welcome', () => {
    assert.equal(mainEvent(config).id, 'baraat');
  });

  test('only the Haldi Carnival has a dress code', () => {
    assert.deepEqual(config.events.filter((ev) => dressFor(config, ev)).map((ev) => ev.id), ['haldi']);
    assert.equal(dressFor(config, config.events.find((e) => e.id === 'haldi')).title.en, 'Pastel Carnival');
    assert.equal(config.dressCode, undefined);
  });
});

describe('site mode', () => {
  test('switches from upcoming → live → thankyou around the functions', () => {
    assert.equal(siteMode(config, Date.parse('2026-11-20T10:00:00+05:30')), 'upcoming');
    assert.equal(siteMode(config, Date.parse('2026-12-02T09:00:00+05:30')), 'live');
    assert.equal(siteMode(config, Date.parse('2026-12-03T23:29:00+05:30')), 'live');
    assert.equal(siteMode(config, Date.parse('2026-12-03T23:30:00+05:30')), 'thankyou');
  });

  test('nextEvent returns the current or next function', () => {
    const evs = allEvents(config);
    assert.equal(nextEvent(evs, Date.parse('2026-12-03T08:00:00+05:30')).id, 'bhaat');
    assert.equal(nextEvent(evs, Date.parse('2026-12-02T20:00:00+05:30')).id, 'sangeet');
    assert.equal(nextEvent(evs, Date.parse('2026-12-03T14:00:00+05:30')).id, 'reception');
    assert.equal(nextEvent(evs, Date.parse('2026-12-05T00:00:00+05:30')), null);
  });
});

describe('programme', () => {
  test('groups functions and meals by day, in order', () => {
    const days = programme(config, allEvents(config));
    assert.deepEqual(days.map((d) => d.date), ['2026-12-02', '2026-12-03']);
    assert.deepEqual(days[0].items.map((i) => i.event?.id || i.name.en), ['haldi', 'Lunch', 'sagai', 'sangeet']);
    assert.deepEqual(days[1].items.map((i) => i.event?.id), ['bhaat', 'baraat', 'reception']);
  });

  test('a meal only appears on a day that has functions', () => {
    const days = programme(config, allEvents(config).filter((e) => e.id === 'reception'));
    assert.deepEqual(days.map((d) => d.items.map((i) => i.event?.id || i.name.en)), [['reception']]);
  });
});
