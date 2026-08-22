/*  PURANI DHUN — the machine
 *  ------------------------------------------------------------------
 *  Holds the queue, talks to YouTube, and keeps the rangoli in step
 *  with whatever is coming out of the speakers.
 *  ------------------------------------------------------------------ */

(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CATALOG = window.CATALOG || [];
  const ROOMS   = window.ROOMS   || [];
  const RG      = window.RANGOLI;

  const CIRC = 2 * Math.PI * 468;   // the progress ring

  const S = {
    room: ROOMS[0].id,
    queue: [], i: 0,
    shuffle: false, playing: false,
    volume: 80, duration: 0, elapsed: 0,
    seeking: false, started: false,
    dead: new Set(),
  };

  /* ── ordering ─────────────────────────────────────────────────────
     Many songs sit in six or seven rooms. Ordered by anything global
     every room would open with the same record, so each room sorts its
     own list by a hash of (room + video): stable, and different in
     every room. */
  function hash32(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const orderFor = (id, list) => list.slice().sort((a, b) => hash32(id + a.v) - hash32(id + b.v));
  const roomById = id => ROOMS.find(r => r.id === id) || ROOMS[0];
  const inRoom   = id => orderFor(id, CATALOG.filter(t => t.r.includes(id) && !S.dead.has(t.v)));
  const track    = () => S.queue[S.i];

  function mmss(s) {
    if (!isFinite(s) || s < 0) s = 0;
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }
  const esc = s => String(s == null ? '' : s)
    .replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ═══ the room ══════════════════════════════════════════════════ */

  // the faintest wash of the room's pigment over the paper
  const BASE = [246, 245, 241];
  function wash(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const p = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return 'rgb(' + p.map((v, i) => Math.round(BASE[i] + (v - BASE[i]) * amount)).join(' ') + ')';
  }

  function paintRoom(id) {
    const room = roomById(id);
    document.documentElement.dataset.room = id;
    const [a, b, c] = room.pigments;
    const st = document.documentElement.style;
    st.setProperty('--pig-a', a);
    st.setProperty('--pig-b', b);
    st.setProperty('--pig-c', c);
    const ground = wash(a, 0.045);
    st.setProperty('--ground', ground);
    // set on the element too: a transition does not refire when only the
    // custom property behind the value changes, so it would stay put
    document.body.style.backgroundColor = ground;
    $('#now-room').textContent = room.name;
    $('#now-room-deva').textContent = room.deva;
    $$('.room-btn').forEach(x => x.setAttribute('aria-current', String(x.dataset.id === id)));
  }

  function buildRoomNav() {
    $('#rooms-list').innerHTML = ROOMS.map(r => `
      <li><button class="room-btn" type="button" data-id="${r.id}" aria-current="false"
                  aria-label="${esc(r.name)}, ${inRoom(r.id).length} tapes">
        <span>${esc(r.dial)}</span><span class="room-btn__n">${inRoom(r.id).length}</span>
      </button></li>`).join('');
    $$('.room-btn').forEach(b => b.addEventListener('click', () => setRoom(b.dataset.id)));
  }

  function setRoom(id) {
    if (id === S.room && S.queue.length) return;
    S.room = id;
    paintRoom(id);
    buildQueue();
    renderIndex();
    $('#index-n').textContent = inRoom(id).length;
    if (S.started) load(S.i, S.playing);
    else if (track()) { paintNowPlaying(track()); markRow(); }
  }

  /* The room's running order is fixed, but the needle drops somewhere
     different each time you walk in — otherwise every visit opens with
     the same record. */
  function buildQueue() {
    const list = inRoom(S.room);
    S.queue = S.shuffle ? shuffled(list) : list;
    S.i = list.length ? Math.floor(Math.random() * list.length) : 0;
  }
  function shuffled(a) {
    const c = a.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  }

  /* ═══ the rangoli ═══════════════════════════════════════════════ */

  function drawRangoli(t) {
    const room = roomById(S.room);
    const fig = RG.build(t.v, room.pigments);
    const rec = $('#record');
    $('#rg-body').innerHTML = fig.svg;
    $('#rangoli').setAttribute('aria-label',
      `Rangoli for ${t.t}: ${fig.fold}-fold, ${fig.rings} rings`);
    // retrigger the draw-on
    rec.classList.remove('is-drawn');
    void rec.offsetWidth;
    rec.classList.add('is-drawn');
  }

  function setProgress(p) {
    $('#rg-progress').style.strokeDashoffset = (CIRC * (1 - clamp(p, 0, 1))).toFixed(1);
  }

  /* ═══ playback ══════════════════════════════════════════════════ */

  let yt = null, ytReady = false, pending = null;

  window.onYouTubeIframeAPIReady = function () {
    yt = new YT.Player('yt-player', {
      height: '1', width: '1',
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          ytReady = true;
          yt.setVolume(S.volume);
          if (pending) { const p = pending; pending = null; load(p.i, p.play); }
        },
        onStateChange: e => {
          // a track takes a second or three to arrive; say so, or pressing
          // a button looks like it did nothing
          document.body.toggleAttribute('data-loading', e.data === YT.PlayerState.BUFFERING);
          if (e.data === YT.PlayerState.PLAYING) { S.playing = true; S.duration = yt.getDuration() || 0; }
          else if (e.data === YT.PlayerState.PAUSED) S.playing = false;
          else if (e.data === YT.PlayerState.ENDED) { S.playing = false; next(); }
          reflect();
        },
        // 100 / 101 / 150 — gone, private, or the label blocked embedding
        onError: () => {
          const t = track();
          if (t) S.dead.add(t.v);
          const at = S.i;
          S.queue.splice(at, 1);
          renderIndex();
          if (!S.queue.length) { buildQueue(); return; }
          load(at % S.queue.length, true);
        },
      },
    });
  };

  function load(i, play) {
    if (!S.queue.length) return;
    S.i = ((i % S.queue.length) + S.queue.length) % S.queue.length;
    const t = track();
    if (!t) return;
    if (!ytReady) { pending = { i: S.i, play }; paintNowPlaying(t); return; }
    S.duration = t.s || 0;
    S.elapsed = 0;
    setProgress(0);
    if (play) yt.loadVideoById(t.v); else yt.cueVideoById(t.v);
    paintNowPlaying(t);
    markRow();
  }

  function paintNowPlaying(t) {
    $('#now-title').textContent  = t.t;
    $('#now-deva').textContent   = t.d || '';
    $('#now-artist').textContent = t.a || '';
    $('#now-film').textContent   = t.al || '';
    $('#now-year').textContent   = t.y || '';
    $('#now-src').href = 'https://www.youtube.com/watch?v=' + t.v;
    drawRangoli(t);
    document.title = t.t + ' — Purani Dhun';
  }

  const play   = () => ytReady && yt.playVideo();
  const pause  = () => ytReady && yt.pauseVideo();
  const toggle = () => (S.playing ? pause() : play());
  const next   = () => load(S.i + 1, true);
  // always the previous record. No "restart this one if you are more than
  // a few seconds in" — pressing back and hearing the same song again is
  // the thing people complain about.
  const prev   = () => load(S.i - 1, true);

  function reflect() {
    const k = $('#k-play');
    k.setAttribute('aria-pressed', String(S.playing));
    k.setAttribute('aria-label', S.playing ? 'Pause' : 'Play');
    document.body.toggleAttribute('data-playing', S.playing);
  }

  function setVolume(v) {
    S.volume = clamp(Math.round(v), 0, 100);
    if (ytReady) yt.setVolume(S.volume);
    const el = $('#vol');
    el.value = S.volume;
    el.style.setProperty('--p', S.volume + '%');
  }

  /* ═══ the clock ═════════════════════════════════════════════════ */

  function tick() {
    if (ytReady && S.playing && !S.seeking) {
      S.elapsed = yt.getCurrentTime() || 0;
      const d = yt.getDuration();
      if (d) S.duration = d;
    }
    if (!S.seeking) {
      const p = S.duration ? clamp(S.elapsed / S.duration, 0, 1) : 0;
      $('#now-elapsed').textContent = mmss(S.elapsed);
      $('#now-total').textContent   = mmss(S.duration);
      const bar = $('#seek');
      bar.value = Math.round(p * 1000);
      bar.style.setProperty('--p', (p * 100).toFixed(2) + '%');
      setProgress(p);
    }
    requestAnimationFrame(tick);
  }

  /* ═══ the index ═════════════════════════════════════════════════ */

  const F = { allRooms: false, moods: new Set(), decades: new Set(), q: '' };

  function buildFilters() {
    const moods   = [...new Set(CATALOG.flatMap(t => t.m))].sort();
    const decades = [...new Set(CATALOG.map(t => t.dc).filter(Boolean))].sort();
    const chip = (k, v, label) =>
      `<button class="chip" type="button" data-k="${k}" data-v="${v}" aria-pressed="false">${label}</button>`;
    $('#filters').innerHTML =
      chip('all', '1', 'Every room') +
      moods.map(m => chip('mood', m, m)).join('') +
      decades.map(d => chip('dec', d, d)).join('');
    $$('#filters .chip').forEach(c => c.addEventListener('click', () => {
      const on = c.getAttribute('aria-pressed') !== 'true';
      c.setAttribute('aria-pressed', String(on));
      const { k, v } = c.dataset;
      if (k === 'all') F.allRooms = on;
      else if (k === 'mood') on ? F.moods.add(v) : F.moods.delete(v);
      else on ? F.decades.add(v) : F.decades.delete(v);
      renderIndex();
    }));
  }

  function filtered() {
    const q = F.q.trim().toLowerCase();
    const rows = CATALOG.filter(t => {
      if (S.dead.has(t.v)) return false;
      if (!F.allRooms && !t.r.includes(S.room)) return false;
      if (F.moods.size && !t.m.some(m => F.moods.has(m))) return false;
      if (F.decades.size && !F.decades.has(t.dc)) return false;
      if (q) {
        const hay = (t.t + ' ' + (t.d || '') + ' ' + t.a + ' ' + (t.al || '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return F.allRooms ? rows : orderFor(S.room, rows);
  }

  // every row wears the colour its own rangoli is drawn in
  const dotFor = t => roomById(S.room).pigments[RG.seedFrom(t.v) % 3];

  function renderIndex() {
    const rows = filtered();
    $('#ix-count').textContent =
      rows.length + (rows.length === 1 ? ' tape' : ' tapes') +
      (F.allRooms ? ' · every room' : ' · ' + roomById(S.room).name);
    $('#ix-empty').hidden = rows.length > 0;
    $('#ix-list').innerHTML = rows.map((t, n) => `
      <li><button class="row" type="button" data-v="${t.v}" aria-current="false">
        <span class="row__dot" style="--dot:${dotFor(t)}"></span>
        <span class="row__i">${String(n + 1).padStart(2, '0')}</span>
        <span class="row__t">${esc(t.t)}${t.d ? `<span class="row__d">${esc(t.d)}</span>` : ''}</span>
        <span class="row__s">${t.s ? mmss(t.s) : '—'}</span>
        <span class="row__a">${esc(t.a)}${t.al ? ' · ' + esc(t.al) : ''}${t.y ? ' · ' + t.y : ''}</span>
      </button></li>`).join('');
    $$('#ix-list .row').forEach(b => b.addEventListener('click', () => pickByVideo(b.dataset.v)));
    markRow();
  }

  function pickByVideo(v) {
    let n = S.queue.findIndex(t => t.v === v);
    if (n < 0) {
      const t = CATALOG.find(x => x.v === v);
      if (!t) return;
      if (!t.r.includes(S.room)) {
        S.room = t.r[0];
        paintRoom(S.room);
        buildQueue();
        $('#index-n').textContent = inRoom(S.room).length;
      }
      n = S.queue.findIndex(x => x.v === v);
      if (n < 0) return;
    }
    S.started = true;
    load(n, true);
    openIndex(false);
  }

  function markRow() {
    const t = track();
    $$('#ix-list .row').forEach(b =>
      b.setAttribute('aria-current', String(!!t && b.dataset.v === t.v)));
  }

  function openIndex(open) {
    const ix = $('#index');
    if (open) ix.hidden = false;
    requestAnimationFrame(() => {
      ix.toggleAttribute('data-open', open);
      if (!open) setTimeout(() => { ix.hidden = true; }, 340);
    });
    $('#index-toggle').setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => $('#q').focus(), 200);
  }

  /* ═══ wiring ════════════════════════════════════════════════════ */

  function wire() {
    $('#k-play').addEventListener('click', () => { S.started = true; toggle(); });
    $('#k-next').addEventListener('click', next);
    $('#k-prev').addEventListener('click', prev);
    $('#k-shuffle').addEventListener('click', () => {
      S.shuffle = !S.shuffle;
      $('#k-shuffle').setAttribute('aria-pressed', String(S.shuffle));
      const cur = track();
      buildQueue();
      if (cur) {
        const n = S.queue.findIndex(t => t.v === cur.v);
        if (n > 0) { S.queue.splice(n, 1); S.queue.unshift(cur); }
        S.i = 0;
      }
      renderIndex();
    });

    const seek = $('#seek');
    seek.addEventListener('pointerdown', () => { S.seeking = true; });
    seek.addEventListener('input', () => {
      const p = seek.value / 1000;
      seek.style.setProperty('--p', (p * 100).toFixed(2) + '%');
      $('#now-elapsed').textContent = mmss(p * S.duration);
      setProgress(p);
    });
    const commit = () => {
      if (!S.seeking) return;
      S.seeking = false;
      if (ytReady && S.duration) yt.seekTo((seek.value / 1000) * S.duration, true);
    };
    seek.addEventListener('change', commit);
    seek.addEventListener('pointerup', commit);

    $('#vol').addEventListener('input', e => setVolume(e.target.value));

    $('#index-toggle').addEventListener('click', () =>
      openIndex($('#index-toggle').getAttribute('aria-expanded') !== 'true'));
    $('#index-close').addEventListener('click', () => openIndex(false));
    let qt;
    $('#q').addEventListener('input', e => {
      clearTimeout(qt);
      qt = setTimeout(() => { F.q = e.target.value; renderIndex(); }, 130);
    });

    addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); openIndex(true); return; }
      if (e.key === 'Escape') { openIndex(false); return; }
      if (typing) return;
      switch (e.key) {
        case ' ':          e.preventDefault(); S.started = true; toggle(); break;
        case 'ArrowRight': e.preventDefault(); next(); break;
        case 'ArrowLeft':  e.preventDefault(); prev(); break;
        case 'ArrowUp':    e.preventDefault(); setVolume(S.volume + 5); break;
        case 'ArrowDown':  e.preventDefault(); setVolume(S.volume - 5); break;
        case 's': case 'S': $('#k-shuffle').click(); break;
        default:
          if (/^[1-9]$/.test(e.key)) { const r = ROOMS[+e.key - 1]; if (r) setRoom(r.id); }
      }
    });

    $('#gate-enter').addEventListener('click', () => {
      $('#gate').setAttribute('data-open', '');
      S.started = true;
      load(S.i, true);
      setTimeout(() => { const g = $('#gate'); if (g) g.remove(); }, 700);
    });
  }

  function loadYT() {
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  /* ═══ boot ══════════════════════════════════════════════════════ */

  function boot() {
    buildRoomNav();
    buildFilters();
    paintRoom(S.room);
    buildQueue();
    renderIndex();
    $('#index-n').textContent = inRoom(S.room).length;
    $('#rg-progress').style.strokeDasharray = CIRC.toFixed(1);
    setProgress(0);
    if (track()) paintNowPlaying(track());
    setVolume(S.volume);

    // a rangoli behind the door, so the idea lands before you press anything
    const gateSvg = $('#gate-rangoli');
    if (gateSvg) gateSvg.innerHTML = RG.build('purani-dhun', roomById(S.room).pigments).svg
      .replace(/class="rg-ring[^"]*"/g, 'class="rg-static"');

    wire();
    loadYT();
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();
})();
