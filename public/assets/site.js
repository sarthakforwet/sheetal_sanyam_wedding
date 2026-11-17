/* Progressive enhancement for the wedding site. Every feature works without
   this file; it adds animation, inline form handling and small conveniences. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let T = {};
  try { T = JSON.parse($('#i18n')?.textContent || '{}'); } catch { /* defaults */ }
  const t = (k, vars) => (T[k] || k).replace(/\{(\w+)\}/g, (m, n) => (vars && vars[n] != null ? vars[n] : m));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  // ── Invitation: curtains part, flap opens, letter rises ────────────────
  function initInvite() {
    const overlay = $('#invite');
    if (!overlay) return;
    const env = $('.envelope', overlay);
    const seal = $('.env-seal', overlay);
    const enter = $('.env-enter', overlay);
    const replay = $('.replay-invite');
    let busy = false;
    const reset = () => {
      overlay.classList.remove('opening', 'opened', 'closing');
      env.style.marginTop = '';
      $('.env-letter', overlay).style.top = '';
    };
    const finish = () => {
      root.classList.remove('show-invite');
      reset();
      store.set('invite-opened', '1');
      if (replay) replay.hidden = false;
      const title = $('#hero-title');
      title?.setAttribute('tabindex', '-1');
      title?.focus({ preventScroll: true });
      busy = false;
    };
    const close = () => {
      if (reduced) return finish();
      overlay.classList.add('closing');
      setTimeout(finish, 800);
    };
    const open = () => {
      if (busy) return;
      busy = true;
      // Lift the letter so its lower part stays tucked in the envelope pocket
      const clip = $('.env-clip', overlay);
      const letter = $('.env-letter', overlay);
      const eH = env.offsetHeight;
      const lH = letter.offsetHeight;
      env.style.marginTop = Math.max(20, lH - eH * 0.45 + 24) + 'px';
      letter.style.top = Math.max(0, clip.offsetHeight - eH * 0.55 - lH) + 'px';
      overlay.classList.add('opening');
      setTimeout(() => { overlay.classList.add('opened'); enter?.focus({ preventScroll: true }); }, reduced ? 0 : 2000);
    };
    seal?.addEventListener('click', open);
    enter?.addEventListener('click', close);
    $('.env-skip', overlay)?.addEventListener('click', finish);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });
    if (root.classList.contains('show-invite')) seal?.focus();
    else if (replay) replay.hidden = false;
    replay?.addEventListener('click', () => {
      reset();
      root.classList.add('show-invite');
      overlay.scrollTop = 0;
      seal?.focus();
    });
  }

  // ── Hero photo slideshow (crossfade + Ken Burns) ───────────────────────
  function initSlideshow() {
    const frame = $('[data-slideshow]');
    if (!frame) return;
    const slides = $$('.slide', frame);
    const dots = $$('.dots i', frame);
    if (slides.length < 2) return;
    // Load the other photos only after the page has finished loading
    const loadRest = () => $$('img[data-src]', frame).forEach((img) => { img.src = img.dataset.src; img.removeAttribute('data-src'); });
    if (document.readyState === 'complete') loadRest(); else addEventListener('load', loadRest, { once: true });
    if (reduced) return;
    let cur = 0;
    setInterval(() => {
      if (document.hidden) return;
      const next = (cur + 1) % slides.length;
      if (!$('img', slides[next]).complete) return;
      slides[cur].classList.remove('on'); dots[cur]?.classList.remove('on');
      cur = next;
      slides[cur].classList.add('on'); dots[cur]?.classList.add('on');
    }, 4500);
  }

  // ── Countdown ──────────────────────────────────────────────────────────
  function initCountdown() {
    const el = $('[data-countdown]');
    if (!el) return;
    const target = Date.parse(el.dataset.countdown);
    const units = { d: $('[data-unit="d"]', el), h: $('[data-unit="h"]', el), m: $('[data-unit="m"]', el), s: $('[data-unit="s"]', el) };
    const tick = () => {
      let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      const set = (k, v) => { const txt = String(v).padStart(2, '0'); if (units[k].textContent !== txt) units[k].textContent = txt; };
      set('d', d); set('h', h); set('m', m); set('s', s);
      if (target - Date.now() <= 0) { clearInterval(timer); setTimeout(() => location.reload(), 1500); }
    };
    const timer = setInterval(tick, 1000);
    tick();
  }

  // ── Background music (off by default) ──────────────────────────────────
  function initMusic() {
    const btn = $('.music-toggle');
    if (!btn) return;
    btn.hidden = false;
    let player = null;
    const setState = (on) => {
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? t('music_pause') : t('music_play'));
    };
    let playing = false;
    const start = async () => {
      if (!player) player = btn.dataset.src ? recordedPlayer(btn.dataset.src) : tanpura();
      try {
        await player.play();
      } catch (err) {
        // The recording is missing or won't load: fall back to the built-in drone
        if (!player.recorded) throw err;
        player = tanpura();
        await player.play();
      }
    };
    btn.addEventListener('click', async () => {
      const on = !playing;
      try {
        if (on) await start(); else player?.pause();
        playing = on;
      } catch { playing = false; }
      setState(playing);
    });
    // Don't keep playing in a background tab
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && playing) { player?.pause(); playing = false; setState(false); }
    });
  }
  function recordedPlayer(src) {
    const a = new Audio();
    a.preload = 'none';
    a.loop = true;
    a.volume = 0.45;
    a.src = src;
    return { recorded: true, play: () => a.play(), pause: () => a.pause() };
  }
  // A soft, synthesised tanpura-style drone (Pa–Sa–Sa–Sa) — no download needed
  function tanpura() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return { play: () => Promise.reject(), pause: () => {} };
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.32;
    const fb = ctx.createGain();
    fb.gain.value = 0.35;
    delay.connect(fb).connect(delay);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    lp.connect(master);
    lp.connect(delay);
    delay.connect(master);
    master.connect(ctx.destination);
    const sa = 138.59; // C#3
    const strings = [sa * 0.75, sa, sa, sa / 2];
    let i = 0;
    let timer = null;
    const pluck = () => {
      const f = strings[i++ % strings.length];
      const now = ctx.currentTime;
      [1, 2, 3, 4.01].forEach((h, k) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = k ? 'sine' : 'triangle';
        o.frequency.value = f * h;
        o.detune.value = (Math.random() - 0.5) * 6;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.18 / (k + 1), now + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
        o.connect(g).connect(lp);
        o.start(now);
        o.stop(now + 4.3);
      });
    };
    return {
      async play() {
        await ctx.resume();
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);
        if (!timer) { pluck(); timer = setInterval(pluck, 1150); }
      },
      pause() {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        clearInterval(timer);
        timer = null;
        setTimeout(() => ctx.suspend(), 700);
      },
    };
  }

  // ── Dialogs: "More" sheet and concierge ────────────────────────────────
  function wireDialog(trigger, dialog) {
    if (!trigger || !dialog || !dialog.showModal) return;
    trigger.addEventListener('click', () => { dialog.showModal(); trigger.setAttribute('aria-expanded', 'true'); });
    dialog.addEventListener('close', () => { trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); });
    $$('[data-close]', dialog).forEach((b) => b.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }

  // ── Lightbox ───────────────────────────────────────────────────────────
  function initLightbox() {
    const lists = $$('[data-lightbox]');
    if (!lists.length) return;
    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Photo');
    dlg.innerHTML = `<div class="lightbox-bar"><span class="lb-count" aria-live="polite"></span><button type="button" class="icon-btn lb-close" aria-label="${t('close')}"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <figure><img alt=""><figcaption></figcaption></figure>
      <div class="lightbox-nav"><button type="button" class="icon-btn prev" aria-label="${t('lightbox_prev')}"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6"/></svg></button><button type="button" class="icon-btn next" aria-label="${t('lightbox_next')}"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6"/></svg></button></div>`;
    document.body.append(dlg);
    const img = $('img', dlg);
    const cap = $('figcaption', dlg);
    let items = [];
    let idx = 0;
    let opener = null;
    const show = (i) => {
      idx = (i + items.length) % items.length;
      const a = items[idx];
      const thumb = $('img', a);
      img.src = a.getAttribute('href');
      img.alt = thumb?.alt || '';
      cap.textContent = thumb?.alt || '';
      $('.lb-count', dlg).textContent = `${idx + 1} / ${items.length}`;
    };
    lists.forEach((list) => list.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-index]');
      if (!a) return;
      e.preventDefault();
      items = $$('a[data-index]', list);
      opener = a;
      dlg.showModal();
      show(items.indexOf(a));
    }));
    $('.prev', dlg).addEventListener('click', () => show(idx - 1));
    $('.next', dlg).addEventListener('click', () => show(idx + 1));
    $('.lb-close', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => opener?.focus());
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    let x0 = null;
    dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  // ── Scroll reveal ──────────────────────────────────────────────────────
  function initReveal() {
    const els = $$('.reveal');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('in'));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    els.forEach((e) => io.observe(e));
  }

  // ── Click-to-load embeds (playlist, highlight film) ────────────────────
  function initFacades() {
    $$('[data-embed]').forEach((box) => {
      $('button', box)?.addEventListener('click', () => {
        const f = document.createElement('iframe');
        f.src = box.dataset.embed;
        f.title = box.textContent.trim();
        f.loading = 'lazy';
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        if (box.dataset.embedHeight) { f.style.height = box.dataset.embedHeight + 'px'; box.style.minHeight = 'auto'; }
        box.replaceChildren(f);
      });
    });
  }

  // ── Packing checklist (saved on this device) ───────────────────────────
  function initPacking() {
    const box = $('[data-packing]');
    if (!box) return;
    const key = `packing:${box.dataset.packing}`;
    let state = {};
    try { state = JSON.parse(store.get(key) || '{}'); } catch { /* fresh */ }
    $$('input[data-key]', box).forEach((cb) => {
      cb.checked = !!state[cb.dataset.key];
      cb.addEventListener('change', () => { state[cb.dataset.key] = cb.checked; store.set(key, JSON.stringify(state)); });
    });
    const applyWho = (who) => $$('[data-who]', box).forEach((el) => el.toggleAttribute('data-who-hidden', who !== 'both' && el.dataset.who !== who));
    const saved = store.get(`${key}:who`) || 'both';
    const radio = $(`input[name="pack-who"][value="${saved}"]`, box);
    if (radio) radio.checked = true;
    applyWho(saved);
    $$('input[name="pack-who"]', box).forEach((r) => r.addEventListener('change', () => { applyWho(r.value); store.set(`${key}:who`, r.value); }));
    $('[data-print]', box)?.addEventListener('click', () => window.print());
  }

  // ── Weather ────────────────────────────────────────────────────────────
  async function initWeather() {
    const box = $('[data-weather]');
    if (!box) return;
    try {
      const res = await fetch('/api/weather');
      const w = await res.json();
      const lang = root.lang === 'hi' ? 'hi-IN' : 'en-IN';
      $('[data-wx-source]', box).textContent = w.source === 'forecast' ? t('weather_forecast') : t('weather_typical');
      $('[data-wx-days]', box).innerHTML = '';
      for (const d of w.days) {
        const li = document.createElement('li');
        const date = new Date(`${d.date}T12:00:00+05:30`).toLocaleDateString(lang, { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
        li.innerHTML = '<strong></strong><span class="wx-temp"></span><span class="muted"></span>';
        li.children[0].textContent = date;
        li.children[1].textContent = `${d.highC}° / ${d.lowC}°C`;
        li.children[2].textContent = t('wx_' + d.code) + (d.rainChance ? ` · ${t('rain_chance', { n: d.rainChance })}` : '');
        $('[data-wx-days]', box).append(li);
      }
    } catch { /* keep the typical-weather fallback */ }
  }

  // ── Copy buttons (copies the nearest [data-copy-text]) ─────────────────
  function initCopy() {
    $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
      const scope = btn.parentElement.querySelector('[data-copy-text]') ? btn.parentElement : btn.closest('section');
      const text = scope?.querySelector('[data-copy-text]')?.textContent.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const old = btn.textContent;
        btn.textContent = t('copied');
        setTimeout(() => { btn.textContent = old; }, 1600);
      } catch { /* clipboard blocked */ }
    }));
  }

  // ── RSVP form: number stepper and quick function pickers ───────────────
  function initRsvp() {
    const form = $('form[data-rsvp]');
    if (!form) return;
    const count = $('input[name="count"]', form);
    $$('[data-step]', form).forEach((b) => {
      b.hidden = false;
      b.addEventListener('click', () => {
        const n = Math.min(30, Math.max(1, (Number.parseInt(count.value, 10) || 1) + Number(b.dataset.step)));
        count.value = String(n);
      });
    });
    const quick = $('.quick', form);
    if (quick) {
      quick.hidden = false;
      const boxes = $$('input[name="events"]', form);
      quick.addEventListener('click', (e) => {
        const pick = e.target.closest('[data-pick]')?.dataset.pick;
        if (!pick) return;
        boxes.forEach((b) => { b.checked = pick === 'all' || b.dataset.day === pick; });
      });
    }
  }

  // ── AI concierge ───────────────────────────────────────────────────────
  function initConcierge() {
    const wrap = $('[data-concierge]');
    if (!wrap) return;
    const dlg = $('dialog', wrap);
    wireDialog($('.concierge-fab', wrap), dlg);
    const log = $('.concierge-log', wrap);
    const form = $('.concierge-form', wrap);
    const input = $('input', form);
    let history = [];
    try { history = JSON.parse(sessionStorage.getItem('concierge') || '[]'); } catch { /* fresh */ }
    const bubble = (role, text) => {
      const p = document.createElement('p');
      p.className = `msg ${role === 'user' ? 'msg-user' : 'msg-bot'}`;
      // Linkify URLs safely (text nodes + anchors only)
      text.split(/(https?:\/\/[^\s)]+)/g).forEach((part, i) => {
        if (i % 2) {
          const a = document.createElement('a');
          a.href = part; a.textContent = part.replace(/^https?:\/\//, ''); a.target = '_blank'; a.rel = 'noopener';
          p.append(a);
        } else p.append(part);
      });
      log.append(p);
      log.scrollTop = log.scrollHeight;
      return p;
    };
    history.forEach((m) => bubble(m.role, m.content));
    const ask = async (q) => {
      q = q.trim();
      if (!q) return;
      history.push({ role: 'user', content: q });
      bubble('user', q);
      input.value = '';
      const wait = bubble('bot', t('concierge_thinking'));
      wait.classList.add('msg-wait');
      form.querySelector('button').disabled = true;
      try {
        const res = await fetch('/api/concierge', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ messages: history.slice(-10) }) });
        const data = await res.json().catch(() => ({}));
        wait.remove();
        if (res.ok && data.text) {
          history.push({ role: 'assistant', content: data.text });
          bubble('bot', data.text);
        } else {
          history.pop();
          bubble('bot', res.status === 429 ? t('err_rate') : `${t('concierge_error')}${data.coordinator ? ' ' + data.coordinator : ''}`);
        }
      } catch {
        wait.remove();
        history.pop();
        bubble('bot', t('concierge_error'));
      } finally {
        form.querySelector('button').disabled = false;
        try { sessionStorage.setItem('concierge', JSON.stringify(history.slice(-20))); } catch { /* ignore */ }
        input.focus();
      }
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
    $$('[data-suggest]', wrap).forEach((b) => b.addEventListener('click', () => ask(b.textContent)));
  }

  const ready = () => {
    initInvite();
    initCountdown();
    initSlideshow();
    initMusic();
    wireDialog($('.more-btn'), $('#more-sheet'));
    initLightbox();
    initReveal();
    initFacades();
    initPacking();
    initWeather();
    initCopy();
    initRsvp();
    initConcierge();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
