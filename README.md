# Sanyam & Sheetal — #SHYAMsaverewithu

A mobile-first wedding website for Sanyam and Sheetal's two-day wedding at Radha Krishna Marriage Resort, Indore (2nd & 3rd December 2026). Guests open one shared link, usually from WhatsApp, so it's server-rendered HTML with one small stylesheet and one small script. Everything still works with JavaScript off.

The look follows the family's invitation site: a "velvet theatre" theme with night and wine backgrounds, gold Playfair Display headings, Poppins body text, cream "paper" cards with lace edges, and the pre-wedding photos.

The site is fully public: everyone with the link sees every function. There are no personal invite links, logins, admin area or database. All content comes from the config file.

**RSVP** (`/rsvp`, linked from the hero, a home-page banner, the highlighted centre button of the bottom bar and the footer): guests fill in a short form (name, attending or not, number of guests, which functions, arrival) and it opens WhatsApp with a formatted reply addressed to `rsvp.whatsapp` in `config/wedding.js`. Nothing is stored on the server; replies arrive in that WhatsApp chat. The form closes automatically once the wedding is over.

## Quick start

```bash
npm install
npm start          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm start` | Run the server |
| `npm run dev` | Run with auto-reload |
| `npm test` | Run the tests: schedule, programme, public site, concierge, i18n, photos |
| `npm run og` | Regenerate the WhatsApp preview image (couple photo + names) and icons |

Requires Node 22 or later.

## What's on the site

- **Invitation intro**: on the first visit the guest taps the gold seal, the curtains part, the flap opens and the family's letter rises. "View the invitation" leads to the photo slideshow and a countdown to the Baraat Welcome. It can be skipped, Esc closes it, and it's skipped entirely under reduced motion. "Replay invitation" brings it back.
- **Home**: the programme ("Ceremonies"), the venue with directions, the "Moments" photo reel, quick links and the "For any queries" phone numbers.
- **Events**: the programme, plus a card per function with time, venue, directions, Google Calendar / `.ics` and a short explanation of the ritual.
- **Dress code**: only the Haldi Carnival has a theme (Pastel Carnival: lavender for women, peach for men), shown with a mood board. Every other function has no dress code. Also a weather forecast for the dates and a packing checklist saved on the guest's phone. To give another function a theme, add a `dress` object to it in the config.
- **Travel & stay**, **Our story**, **Families** (both sets of parents), an English/Hindi switch, background music (off by default), and an optional AI chat assistant.
- **Thank-you mode**: after the last function ends, `/` becomes a thank-you page with the highlight film, photos, and optionally a link and QR code to the official photos.

## Making changes

All content lives in **`config/wedding.js`**, and every text field there is `{ en, hi }`. Interface labels are in **`config/i18n.js`**. After editing, push to GitHub and Vercel redeploys automatically.

- **Programme**: `events` (time, venue, colour, description) and `programmeExtras` (meals shown in the timeline). Only start times are shown; each `end` is used for calendar entries and to decide when the thank-you page takes over.
- **Venue**: `venues`. **Contacts**: `contacts` (the "For any queries" numbers) and `coordinator.whatsapp` (behind every "WhatsApp the family" link).
- **Families**: `families[].members`. Add `photo: '/img/family/name.jpg'` to replace the monogram avatars.
- **Photos**: in `public/img/photos/` as WebP (full size plus `-sm` thumbnails). `photos` picks the hero slideshow, venue arch, closing photo and the WhatsApp preview photo (`photos.og`; run `npm run og` after changing it). `story.timeline` and `story.gallery` hold the captioned photos.
- **After the wedding**: set `thankYou.videoEmbed` (e.g. `https://www.youtube-nocookie.com/embed/<id>`) and `thankYou.photosLink.url`.
- **Music**: the speaker button plays `public/audio/tere-naina-instrumental.mp3` (set in `music.src`), looping, only after a guest taps it, and it pauses when they leave the tab. If the file is missing, a soft synthesised tanpura drone plays instead. Use a recording you have the right to use, and keep it small (around 128 kbps; a 3–4 minute track is 3–4 MB).

**Testing time-based behaviour:** set `SIMULATE_NOW=2026-12-03T19:30:00+05:30` in `.env` to see the "happening now" banner, or `2026-12-04T10:00:00+05:30` for thank-you mode.

## Deploying to Vercel

`public/` is served by Vercel's CDN. Every other request is rewritten (in `vercel.json`) to a single Vercel Function, `api/index.js`, which runs the Express app. `vercel.json` also runs the function in Mumbai (`bom1`) and sets long cache lifetimes for `/assets` and `/img`. There's no database to set up.

1. **Push to GitHub.** The repo must include `api/`, `vercel.json`, `public/og.png`, `public/img/` and `package-lock.json`.
2. **Import the repo** at vercel.com/new. Framework preset: *Other*. Leave the root directory, build command and output directory empty (Vercel then serves `public/` and builds `api/`).
3. **Environment variables** (Settings → Environment Variables). All are optional:

   | Variable | Value |
   |---|---|
   | `BASE_URL` | Your custom domain, e.g. `https://sanyamweds.com`. If unset, the `.vercel.app` production domain is used. |
   | `ANTHROPIC_API_KEY` | Turns on the chat assistant. |

4. **Deploy**, then share the link. To check the WhatsApp preview, paste the link into a chat; if an old preview sticks, add `?v=2` to the link.
5. **Custom domain (optional):** add it under Settings → Domains, set `BASE_URL` to it, and redeploy. Environment variable changes always need a redeploy.

## AI concierge

Set `ANTHROPIC_API_KEY` and a chat button appears. It answers only from the wedding details in the config. It doesn't know about individual guests, so for questions such as rooms it points people to the family's WhatsApp.

- Uses the official Anthropic SDK with `claude-opus-5-5` at `effort: "low"` (override with `CONCIERGE_MODEL`). The wedding details are prompt-cached, and server-side refusal fallbacks are on (`fallbacks: "default"`).
- Limited to 8 messages per minute and 80 per day per visitor, with the conversation trimmed to 10 turns. Limits are kept per server instance, so on Vercel they're best-effort.
- Without a key the button is hidden and `/api/concierge` returns 404.

## Privacy & security

- Search engines are kept out by default (`indexable: false`: a `noindex` meta tag and a `robots.txt` that disallows everything).
- A strict Content Security Policy with per-request nonces, `frame-ancestors 'none'` and `Referrer-Policy: same-origin`. Cross-site POSTs to the chat endpoint are rejected.
- The only cookie is the visitor's language choice.

## Project layout

```
config/            wedding.js (content), i18n.js (UI strings)
src/index.js       entry: default-exports the app for Vercel, or listens locally
src/create-app.js  app factory: security headers, language, routes
src/routes/        site pages, JSON API (weather, concierge)
src/lib/           schedule & programme, security, calendar, QR, weather, concierge
src/views/         server-rendered templates (auto-escaping html`` helper)
public/            CSS/JS, photos, icons, WhatsApp preview image (served by Vercel's CDN)
scripts/assets.js  generates the preview image and icons
test/              node:test suites
```
