// Security middleware: headers + CSP with per-request nonce, same-origin
// enforcement for state-changing requests, and in-memory rate limiting.

import crypto from 'node:crypto';

export function securityHeaders({ https = false } = {}) {
  return (req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce;
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "media-src 'self' blob:",
        "connect-src 'self'",
        'frame-src https://open.spotify.com https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com',
        "base-uri 'self'",
        // RSVP submits to /rsvp, which redirects to WhatsApp
        "form-action 'self' https://wa.me https://api.whatsapp.com",
        "frame-ancestors 'none'",
        "object-src 'none'",
      ].join('; '),
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Keep full page URLs to ourselves when following outbound links
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    if (https) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  };
}

// Reject cross-site state-changing requests (CSRF). Cookies are SameSite=Lax
// as well; this is the belt to that pair of braces.
export function sameOrigin() {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const site = req.get('sec-fetch-site');
    if (site && !['same-origin', 'none'].includes(site)) return res.status(403).json({ error: 'cross_site' });
    const origin = req.get('origin');
    if (origin && origin !== 'null') {
      let host;
      try {
        host = new URL(origin).host;
      } catch {
        return res.status(403).json({ error: 'bad_origin' });
      }
      if (host !== req.get('host')) return res.status(403).json({ error: 'cross_origin' });
    }
    next();
  };
}

// Fixed-window counter keyed by an arbitrary string.
export function createRateLimiter({ now = () => Date.now() } = {}) {
  const hits = new Map();
  const sweep = setInterval(() => {
    const t = now();
    for (const [k, v] of hits) if (v.reset <= t) hits.delete(k);
  }, 60_000);
  sweep.unref?.();

  function take(key, limit, windowMs) {
    const t = now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= t) {
      entry = { count: 0, reset: t + windowMs };
      hits.set(key, entry);
    }
    entry.count++;
    return { ok: entry.count <= limit, retryAfter: Math.ceil((entry.reset - t) / 1000) };
  }

  // Express middleware; `scope` names the bucket, keyed per client IP
  function limit(scope, max, windowMs) {
    return (req, res, next) => {
      const who = `ip:${req.ip}`;
      const r = take(`${scope}:${who}`, max, windowMs);
      if (r.ok) return next();
      res.setHeader('Retry-After', String(r.retryAfter));
      if (req.accepts(['json', 'html']) === 'json' || req.path.startsWith('/api/')) {
        return res.status(429).json({ error: 'rate_limited', retryAfter: r.retryAfter });
      }
      res.status(429).type('text').send('Too many requests — please wait a minute and try again.');
    };
  }

  return { take, limit, reset: () => hits.clear() };
}
