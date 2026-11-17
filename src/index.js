// Server entry point.
//  • On Vercel this module is imported and the default-exported app becomes a
//    Vercel Function.
//  • Locally (`npm start`) it listens on PORT.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './create-app.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const onVercel = !!process.env.VERCEL;
if (!onVercel) {
  try {
    process.loadEnvFile?.(path.join(ROOT, '.env'));
  } catch {
    /* no .env file — rely on the real environment */
  }
}

const app = createApp({ env: process.env });
export default app;

if (!onVercel) {
  // Local-only: generate the share image and icons if they're missing
  const { ensureAssets } = await import('../scripts/assets.js');
  await ensureAssets();
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.log(`\n  ${app.locals.deps.baseUrl}`);
    if (!process.env.ANTHROPIC_API_KEY) console.log('  ℹ ANTHROPIC_API_KEY not set — concierge widget hidden.');
  });
  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
