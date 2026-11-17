// Load the app the way Vercel does: import api/index.js with VERCEL set and
// call its default export as a plain (req, res) handler.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

test('api/index.js serves the site as a Vercel Function', async () => {
  process.env.VERCEL = '1';
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'example.vercel.app';
  const { default: handler } = await import('../api/index.js');
  assert.equal(typeof handler, 'function');

  const server = http.createServer(handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const p of ['/', '/events', '/style', '/travel', '/story', '/family', '/robots.txt', '/cal/all.ics']) {
      assert.equal((await fetch(base + p)).status, 200, p);
    }
    const home = await (await fetch(base + '/')).text();
    assert.match(home, /og:image" content="https:\/\/example\.vercel\.app\/og\.png"/);
    // Unknown paths get the site's own (styled) 404, not the platform's
    const missing = await fetch(base + '/no-such-page');
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /page-error/);
  } finally {
    server.close();
  }
});
