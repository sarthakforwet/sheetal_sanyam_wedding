// Spin up an isolated app on a random port.

import { createApp } from '../src/create-app.js';

export const BEFORE = Date.parse('2026-11-15T12:00:00+05:30');
export const AFTER_WEDDING = Date.parse('2026-12-04T09:00:00+05:30');

export async function startApp({ now = BEFORE, env = {} } = {}) {
  const clock = { now };
  const app = createApp({ now: () => clock.now, env: { BASE_URL: 'http://localhost', ...env } });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  // fetch that sends a same-origin header (and optionally a cookie)
  const request = (p, { cookie = '', headers = {}, ...opts } = {}) =>
    fetch(base + p, { redirect: 'manual', ...opts, headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}), ...headers } });

  return { app, base, clock, request, close: () => new Promise((r) => server.close(r)) };
}
