/*  PURANI DHUN — the machine
 *  ------------------------------------------------------------------
 *  Same engine as the gym page: a queue, a YouTube iframe, a tempo
 *  clock, a WebGL corridor and a shake. What is different is what sits
 *  in the middle of it — nine rooms of old Hindi records, and a cassette
 *  transport running while the song does.
 *
 *  The room decides the light. Each of the nine carries a pigment triad,
 *  and that triad is handed to three places at once: the transport's hub
 *  and head, the corridor's hazard paint and lamps, and the page's accent
 *  token. Walk into Dard 90s and the whole site goes jamun.
 *
 *  ── on the beat ───────────────────────────────────────────────────
 *  Nothing here is listening to the audio. The player is a cross-origin
 *  YouTube iframe: createMediaElementSource() needs same-origin media
 *  and there is no API for the spectrum. What it keeps instead is a
 *  tempo clock off the playback position, defaulting to 84 BPM — old
 *  film songs sit slower than the gym page's 96 — and the Tap key sets
 *  the real tempo and phase, per track, remembered.
 *  ------------------------------------------------------------------ */

(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CATALOG = window.CATALOG || [];
  const ROOMS   = window.ROOMS   || [];
  const RL      = window.REELS;

  const DEFAULT_BPM = 84;
  const FORCE_CAP = REDUCED ? 0.28 : 1;

  const S = {
    room: ROOMS[0].id,
    queue: [], i: 0,
    shuffle: false, playing: false, started: false,
    volume: 80, force: 0.55,
    duration: 0, elapsed: 0, seeking: false,
    dead: new Set(),
    bpm: DEFAULT_BPM, phase0: 0, lastBeat: -1,
    beat: 0, bar: 0, dist: 0, roll: 0,
    shakeX: 0, shakeY: 0, kick: 0,
  };

  /* ═══ store ═════════════════════════════════════════════════════ */
  const KEY = 'dhun:v2';
  const store = {
    read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} },
    patch(o) { const d = this.read(); this.write(Object.assign(d, o)); },
    bpmFor(v) { return (this.read().bpm || {})[v] || null; },
    setBpm(v, n) { const d = this.read(); d.bpm = d.bpm || {}; d.bpm[v] = n; this.write(d); },
  };

  /* ═══ helpers ═══════════════════════════════════════════════════ */
  const esc = s => String(s == null ? '' : s)
    .replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function mmss(s) {
    if (!isFinite(s) || s < 0) s = 0;
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }
  function hash32(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  /* Many songs sit in six or seven rooms. Ordered by anything global,
     every room would open with the same record — so each room sorts its
     own list by a hash of (room + video): stable, different everywhere. */
  const orderFor = (id, list) => list.slice().sort((a, b) => hash32(id + a.v) - hash32(id + b.v));
  const roomById = id => ROOMS.find(r => r.id === id) || ROOMS[0];
  const inRoom   = id => orderFor(id, CATALOG.filter(t => t.r.includes(id) && !S.dead.has(t.v)));
  const track    = () => S.queue[S.i];

  function shuffled(a) {
    const c = a.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  }

  /*  The room's running order is fixed, but the needle drops somewhere
      different each time you walk in. */
  function buildQueue(keep) {
    const list = inRoom(S.room);
    S.queue = S.shuffle ? shuffled(list) : list;
    if (keep) {
      const n = S.queue.findIndex(t => t.v === keep.v);
      S.i = n < 0 ? 0 : n;
    } else {
      S.i = list.length ? Math.floor(Math.random() * list.length) : 0;
    }
  }

  /* ═══ the beat clock ════════════════════════════════════════════ */

  const taps = [];
  function armTrack(t) {
    S.bpm = (t && store.bpmFor(t.v)) || DEFAULT_BPM;
    S.phase0 = 0; S.lastBeat = -1; taps.length = 0;
    $('#bpm').textContent = Math.round(S.bpm);
    $('#k-tap').classList.toggle('is-set', !!(t && store.bpmFor(t.v)));
  }
  function tap() {
    const now = performance.now() / 1000;
    if (taps.length && now - taps[taps.length - 1] > 2.2) taps.length = 0;
    taps.push(now);
    if (taps.length > 6) taps.shift();
    if (taps.length >= 2) {
      let sum = 0;
      for (let i = 1; i < taps.length; i++) sum += taps[i] - taps[i - 1];
      S.bpm = clamp(60 / (sum / (taps.length - 1)), 40, 200);
      S.phase0 = S.elapsed; S.lastBeat = -1;
      const t = track();
      if (t) { store.setBpm(t.v, Math.round(S.bpm)); $('#k-tap').classList.add('is-set'); }
      $('#bpm').textContent = Math.round(S.bpm);
    }
  }

  /* ═══ the room ══════════════════════════════════════════════════ */

  /*  A hex to the [0..1] triple the shader wants. */
  const rgb01 = hex => {
    const n = parseInt(hex.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let LOOK = null;

  function paintRoom(id) {
    const room = roomById(id);
    document.documentElement.dataset.room = id;
    /*  The lifted nine, not the darkened nine: this page is black now,
        so jamun and indigo are the ones that would vanish. See
        PIGMENT_GLOW in rooms.js. */
    const [a, b, c] = room.glow;
    const st = document.documentElement.style;
    st.setProperty('--pig-a', a);
    st.setProperty('--pig-b', b);
    st.setProperty('--pig-c', c);
    /*  The room's lead pigment IS the page accent, so every chip, key,
        slider and progress ring follows the room. */
    st.setProperty('--haz', a);
    st.setProperty('--haz-deep', room.pigments[0]);
    if (themeMeta) themeMeta.setAttribute('content', '#08090b');
    LOOK = { accent: rgb01(a), lamp: rgb01(b), mood: 0.2, party: 0 };
    $('#now-room').textContent = room.name;
    $$('.room-btn').forEach(x => x.setAttribute('aria-current', String(x.dataset.id === id)));
  }

  /*  The plates. They live in the picker overlay now rather than in a
      rail across the top, so nothing here has to scroll and nothing has
      to be walked into view. */
  function buildRoomNav() {
    $('#rooms-list').innerHTML = ROOMS.map(r => `
      <button class="room-btn" type="button" data-id="${r.id}" aria-current="false"
              aria-label="${esc(r.name)}, ${inRoom(r.id).length} tapes">
        <span class="room-btn__dial">${esc(r.name)}</span>
      </button>`).join('');
    $$('.room-btn').forEach(b => b.addEventListener('click', () => {
      setRoom(b.dataset.id);
      openPicker(false);
    }));
  }

  function setRoom(id, force) {
    if (id === S.room && S.queue.length && !force) return;
    S.room = id;
    paintRoom(id);
    buildQueue();
    countUp();
    renderList();
    store.patch({ room: id });
    if (S.started) load(S.i, S.playing);
    else if (track()) { paint(track()); armTrack(track()); markRow(); }
  }

  function countUp() {
    const n = inRoom(S.room).length;
    $('#n-all').textContent = String(n).padStart(2, '0');
    $('#list-n').textContent = n;
    const g = $('#boot-n');
    if (g) g.textContent = CATALOG.length;
  }

  /* ═══ the rooms ═════════════════════════════════════════════════ */

  /*  Opened from the room name above the song. Same shape as the track
      rack: it is hidden outright when closed rather than merely
      transparent, so nothing behind it is reachable by tab. */
  function openPicker(open) {
    const el = $('#picker');
    if (open) el.hidden = false;
    requestAnimationFrame(() => {
      el.toggleAttribute('data-open', open);
      if (!open) setTimeout(() => { el.hidden = true; }, 260);
    });
    $('#k-rooms').setAttribute('aria-expanded', String(open));
    if (open) {
      const cur = $('.room-btn[aria-current="true"]');
      setTimeout(() => (cur || $('.room-btn')).focus(), 140);
    } else if (el.contains(document.activeElement)) {
      $('#k-rooms').focus();
    }
  }

  /* ═══ the transport ═════════════════════════════════════════════ */

  /*  Built once and then only ever handed numbers — the reels are the
      same machine all the way through, it is the tape in them that
      changes. The label is what a screen reader gets instead, and it is
      the position rather than the picture, because the position is the
      only part of this that carries information. */
  let reels = null;
  function newTape(t) {
    if (!reels) return;
    reels.reset(0);
    const rec = $('#record');
    rec.classList.remove('is-drawn');
    void rec.offsetWidth;                 // retrigger the drop-in
    rec.classList.add('is-drawn');
    $('#reels').setAttribute('aria-label', `Cassette reels for ${t.t}`);
  }
  function setProgress(p, dt, running) {
    if (reels) reels.frame(clamp(p, 0, 1), dt || 0, !!running);
  }

  /* ═══ the corridor ══════════════════════════════════════════════ */

  let gpu = null;
  function startCorridor() {
    const cv = $('#bg');
    gpu = window.CORRIDOR ? window.CORRIDOR.start(cv) : null;
    if (!gpu) cv.style.display = 'none';
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (ytReady && S.playing && !S.seeking) {
      S.elapsed = yt.getCurrentTime() || 0;
      const d = yt.getDuration();
      if (d) S.duration = d;
    }

    const beatLen = 60 / S.bpm;
    if (S.playing) {
      const n = (S.elapsed - S.phase0) / beatLen;
      const idx = Math.floor(n), ph = n - idx;
      S.beat = Math.pow(1 - ph, 3);
      S.bar  = ((((idx % 4) + 4) % 4) === 0) ? Math.pow(1 - ph, 4) : 0;
      if (idx !== S.lastBeat) {
        S.lastBeat = idx;
        S.kick = 1;
        const ang = Math.random() * Math.PI * 2;
        S.shakeX = Math.cos(ang); S.shakeY = Math.sin(ang);
      }
    } else {
      S.beat *= Math.pow(0.02, dt);
      S.bar  *= Math.pow(0.02, dt);
    }
    S.kick *= Math.pow(0.004, dt);

    const F = S.force * FORCE_CAP;
    S.dist += dt * (S.playing ? (3.4 + 8 * S.beat * F) : 0.5);
    S.roll  = Math.sin(S.dist * 0.05) * 0.04 * (0.3 + F) +
              (REDUCED ? 0 : S.kick * F * 0.03 * S.shakeX);

    if (gpu && !gpu.lost() && LOOK) {
      gpu.draw({ time: now / 1000, dist: S.dist, beat: S.beat, bar: S.bar,
                 force: F, roll: S.roll, accent: LOOK.accent, lamp: LOOK.lamp,
                 mood: LOOK.mood, party: LOOK.party });
    }

    /* the canvas takes the shake, not its clipping frame — see loha.css */
    const room = $('#bg'), type = $('#type');
    if (REDUCED) {
      room.style.transform = ''; type.style.transform = '';
      type.style.setProperty('--split', '0px');
    } else {
      const amp = S.kick * F * 11;
      room.style.transform =
        `translate3d(${(S.shakeX * amp).toFixed(2)}px, ${(S.shakeY * amp).toFixed(2)}px, 0)`;
      type.style.transform =
        `translate3d(${(S.shakeX * amp * -0.42).toFixed(2)}px, ${(S.shakeY * amp * -0.42).toFixed(2)}px, 0)`;
      type.style.setProperty('--split', (S.kick * F * 4).toFixed(2) + 'px');
    }
    document.documentElement.style.setProperty('--pulse', S.beat.toFixed(3));
    $('#beatbar').style.opacity = (S.kick * 0.9).toFixed(3);

    if (!S.seeking) {
      const p = S.duration ? clamp(S.elapsed / S.duration, 0, 1) : 0;
      $('#t-now').textContent = mmss(S.elapsed);
      $('#t-all').textContent = mmss(S.duration);
      $('#fill').style.width = (p * 100).toFixed(2) + '%';
      $('#beatbar').style.left = (p * 100).toFixed(2) + '%';
      $('#seek').value = Math.round(p * 1000);
      setProgress(p, dt, S.playing);
    }
    requestAnimationFrame(frame);
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
          renderList(); countUp();
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
    armTrack(t);
    if (!ytReady) { pending = { i: S.i, play }; paint(t); return; }
    S.duration = t.s || 0;
    S.elapsed = 0;
    if (play) yt.loadVideoById(t.v); else yt.cueVideoById(t.v);
    paint(t);
    markRow();
  }


  /*  ── one line, always ─────────────────────────────────────────────
      A title never wraps. CSS cannot shrink type to fit a box, so this
      measures: set the size CSS asked for, ask how wide the text wants
      to be on one line, and scale down by the ratio if it overflows.

      `scrollWidth` on a nowrap element is the full text width even when
      it is wider than the box, which is the whole trick. The floor stops
      a pathological title becoming unreadable — past that it ellipsises,
      which is still one line.

      13px is measured, not guessed. Across every title in the catalogue:
      nothing is clipped at any desktop width; at 390px it costs 2.4% of
      the Hindi titles and none of the Punjabi or worldwide ones; only at
      320px does it bite (14% of the Hindi ones, whose names are long).
      A higher floor clipped far more, a lower one stopped being
      readable. */
  const TITLE_MIN = 13;
  function fitOneLine(el) {
    if (!el) return;
    el.style.fontSize = '';                 /* back to whatever CSS says */
    /*  Measure the title's OWN box, not its parent's. On a narrow screen
        the title is deliberately wider than the column it sits in (it
        bleeds into the shell's padding), so the parent's width is the
        wrong number and the fit came out too small. clientWidth is the
        space this element actually has; scrollWidth is what the text
        wants on one line. */
    const avail = el.clientWidth;
    if (!avail) return;
    const want = el.scrollWidth;
    if (want <= avail) return;
    const max = parseFloat(getComputedStyle(el).fontSize) || 16;
    /* 0.995 keeps a hair of room so sub-pixel rounding cannot re-wrap it */
    el.style.fontSize = Math.max(TITLE_MIN, Math.floor(max * (avail / want) * 0.995)) + 'px';
  }

  function paint(t) {
    /*  One title, in Latin. This used to set the Devanagari as the title
        and the Latin underneath as a transliteration, which meant every
        song on the page said itself twice — and only 253 of the 369
        records had the Devanagari to say it with, so a third of them said
        it once anyway. The catalogue keeps `d` because SEARCH still uses
        it: typing चुराके finds the song. It is simply not printed. */
    $('#now-title').textContent  = t.t;
    fitOneLine($('#now-title'));
    $('#now-artist').textContent = t.a || '';
    $('#now-film').textContent   = t.al || '';
    $('#now-year').textContent   = t.y || '';
    $('#src').href = 'https://www.youtube.com/watch?v=' + t.v;
    $('#n-now').textContent = String(S.i + 1).padStart(2, '0');
    newTape(t);
    document.title = t.t + ' — Purani Dhun';
  }

  const play   = () => ytReady && yt.playVideo();
  const pause  = () => ytReady && yt.pauseVideo();
  const toggle = () => (S.playing ? pause() : play());
  const next   = () => load(S.i + 1, true);
  /*  Always the previous record. No "restart this one if you are a few
      seconds in" — pressing back and hearing the same song is the thing
      people complain about. */
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
    store.patch({ volume: S.volume });
  }
  function setForce(v) {
    S.force = clamp(v, 0, 100) / 100;
    const el = $('#force');
    el.value = Math.round(S.force * 100);
    el.style.setProperty('--p', Math.round(S.force * 100) + '%');
    store.patch({ force: Math.round(S.force * 100) });
  }

  /* ═══ the index ═════════════════════════════════════════════════ */

  const F = { allRooms: false, moods: new Set(), decades: new Set(), q: '' };

  function buildFilters() {
    const moods   = [...new Set(CATALOG.flatMap(t => t.m))].sort();
    const decades = [...new Set(CATALOG.map(t => t.dc).filter(Boolean))].sort();
    const chip = (k, v, label) =>
      `<button class="chip" type="button" data-k="${k}" data-v="${esc(v)}" aria-pressed="false">${esc(label)}</button>`;
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
      renderList();
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

  function renderList() {
    const rows = filtered();
    $('#list-count').textContent =
      rows.length + (rows.length === 1 ? ' tape' : ' tapes') +
      ' · ' + (F.allRooms ? 'every room' : roomById(S.room).name);
    $('#none').hidden = rows.length > 0;
    $('#rows').innerHTML = rows.map((t, n) => `
      <li><button class="row" type="button" data-v="${esc(t.v)}" aria-current="false">
        <span class="row__i">${String(n + 1).padStart(2, '0')}</span>
        <span class="row__t">${esc(t.t)}</span>
        <span class="row__a">${esc(t.a)}${t.al ? ' · ' + esc(t.al) : ''}${t.y ? ' · ' + t.y : ''}</span>
        <span class="row__s">${t.s ? mmss(t.s) : '—'}</span>
      </button></li>`).join('');
    $$('#rows .row').forEach(b => b.addEventListener('click', () => pick(b.dataset.v)));
    markRow();
  }

  function pick(v) {
    let n = S.queue.findIndex(t => t.v === v);
    if (n < 0) {
      const t = CATALOG.find(x => x.v === v);
      if (!t) return;
      if (!t.r.includes(S.room)) { S.room = t.r[0]; paintRoom(S.room); buildQueue(); countUp(); }
      n = S.queue.findIndex(x => x.v === v);
      if (n < 0) return;
    }
    S.started = true;
    load(n, true);
    openList(false);
  }

  function markRow() {
    const t = track();
    $$('#rows .row').forEach(b =>
      b.setAttribute('aria-current', String(!!t && b.dataset.v === t.v)));
  }

  function openList(open) {
    const el = $('#list');
    if (open) el.hidden = false;
    requestAnimationFrame(() => {
      el.toggleAttribute('data-open', open);
      if (!open) setTimeout(() => { el.hidden = true; }, 300);
    });
    $('#k-list').setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => $('#q').focus(), 180);
  }

  /* ═══ wiring ════════════════════════════════════════════════════ */

  function wire() {
    $('#k-play').addEventListener('click', () => { S.started = true; toggle(); });
    $('#k-next').addEventListener('click', next);
    $('#k-prev').addEventListener('click', prev);
    $('#k-tap').addEventListener('click', tap);

    $('#k-shuffle').addEventListener('click', () => {
      S.shuffle = !S.shuffle;
      $('#k-shuffle').setAttribute('aria-pressed', String(S.shuffle));
      buildQueue(track());
      renderList();
    });

    const seek = $('#seek');
    seek.addEventListener('pointerdown', () => { S.seeking = true; });
    seek.addEventListener('input', () => {
      const p = seek.value / 1000;
      $('#fill').style.width = (p * 100).toFixed(2) + '%';
      $('#t-now').textContent = mmss(p * S.duration);
      /*  Scrubbing spins the reels, because scrubbing really does move
          tape. The engine reads the jump in position, not the clock. */
      setProgress(p, 0, false);
    });
    const commit = () => {
      if (!S.seeking) return;
      S.seeking = false;
      if (ytReady && S.duration) yt.seekTo((seek.value / 1000) * S.duration, true);
    };
    seek.addEventListener('change', commit);
    seek.addEventListener('pointerup', commit);

    $('#vol').addEventListener('input', e => setVolume(e.target.value));
    $('#force').addEventListener('input', e => setForce(+e.target.value));

    $('#k-list').addEventListener('click', () =>
      openList($('#k-list').getAttribute('aria-expanded') !== 'true'));
    $('#list-close').addEventListener('click', () => openList(false));

    $('#k-rooms').addEventListener('click', () =>
      openPicker($('#k-rooms').getAttribute('aria-expanded') !== 'true'));
    $('#picker-close').addEventListener('click', () => openPicker(false));
    /* clicking the ground behind the plates closes it, like any dialog */
    $('#picker').addEventListener('click', e => {
      if (e.target === $('#picker')) openPicker(false);
    });
    let qt;
    $('#q').addEventListener('input', e => {
      clearTimeout(qt);
      qt = setTimeout(() => { F.q = e.target.value; renderList(); }, 130);
    });

    addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); openList(true); return; }
      if (e.key === 'Escape') { openList(false); openPicker(false); return; }
      if (typing) return;
      switch (e.key) {
        case ' ':          e.preventDefault(); S.started = true; toggle(); break;
        case 'ArrowRight': e.preventDefault(); next(); break;
        case 'ArrowLeft':  e.preventDefault(); prev(); break;
        case 'ArrowUp':    e.preventDefault(); setVolume(S.volume + 5); break;
        case 'ArrowDown':  e.preventDefault(); setVolume(S.volume - 5); break;
        case 's': case 'S': $('#k-shuffle').click(); break;
        case 'r': case 'R':
          openPicker($('#k-rooms').getAttribute('aria-expanded') !== 'true');
          break;
        case 't': case 'T': tap(); break;
        default:
          if (/^[1-9]$/.test(e.key)) { const r = ROOMS[+e.key - 1]; if (r) setRoom(r.id); }
      }
    });

  }

  function loadYT() {
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  /* ═══ the loading screen ════════════════════════════════════════ */

  /*  It fills for a fixed time and then lets you in. There used to be a
      button, and the button was load-bearing: a browser will not start
      audio without a user gesture, so the press that opened the door was
      also the press that unlocked the sound.

      So the gesture is kept, but not demanded. A tap or a keypress
      during the load skips ahead AND counts as the unlock, so the music
      starts. Waiting it out lands you on a CUED player instead — the
      track is loaded, nothing is playing, and the play key says so.
      What this will not do is claim to have started audio it did not. */
  function bootSplash() {
    const el = $('#boot');
    if (!el) { S.started = true; return; }
    const MS = REDUCED ? 700 : 2600;
    el.style.setProperty('--boot', MS + 'ms');

    let gone = false;
    function enter(byGesture) {
      if (gone) return;
      gone = true;
      el.setAttribute('data-go', '');
      S.started = true;
      load(S.i, !!byGesture);
      setTimeout(() => { const b = $('#boot'); if (b) b.remove(); }, 620);
    }
    const skip = () => enter(true);
    ['pointerdown', 'keydown', 'touchstart'].forEach(t =>
      el.addEventListener(t, skip, { passive: true }));
    /* a gesture anywhere counts, not only on the screen itself */
    addEventListener('pointerdown', skip, { once: true, passive: true });

    /*  The bar and the exit start together, inside one frame. Kicking the
        bar off in CSS and the timer off here would give them two clocks,
        and on a slow first paint the bar had not moved when the screen
        left. requestAnimationFrame means a frame has actually been
        rendered, so the transition is guaranteed to take effect. */
    requestAnimationFrame(() => {
      el.setAttribute('data-run', '');
      setTimeout(() => enter(false), MS);
    });
  }

  /* ═══ boot ══════════════════════════════════════════════════════ */

  function boot() {
    const saved = store.read();
    if (ROOMS.some(r => r.id === saved.room)) S.room = saved.room;

    startCorridor();
    buildRoomNav();
    buildFilters();
    wire();

    setVolume(typeof saved.volume === 'number' ? saved.volume : 80);
    setForce(typeof saved.force === 'number' ? saved.force : (REDUCED ? 100 : 55));

    reels = RL && RL.mount($('#reels'));
    setRoom(S.room, true);
    setProgress(0, 0, false);
    if (track()) { paint(track()); armTrack(track()); }

    /*  A transport behind the loading screen, so the idea lands before
        the page does. Still — no tape is moving yet, and a reel turning
        with nothing playing would be the first lie on the page. */
    const bootSvg = $('#boot-reels');
    if (bootSvg && RL) RL.still(bootSvg, 0.34);

    addEventListener('resize', () => fitOneLine($('#now-title')));

    loadYT();
    bootSplash();
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();
})();
