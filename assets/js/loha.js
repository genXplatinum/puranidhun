/*  LOHA — the machine
 *  ------------------------------------------------------------------
 *  Two decks, one corridor.
 *
 *    NOW      2019 onward — the heavy modern stuff
 *    2005–18  the era: what was actually on repeat in gyms then
 *
 *  A track belongs to one deck or the other by its release year. There
 *  is no overlap and no judgement call: 2018 and earlier is the era.
 *
 *  ── on the beat ───────────────────────────────────────────────────
 *  The player is a cross-origin YouTube iframe, so its audio cannot be
 *  reached — createMediaElementSource() needs same-origin media, and
 *  there is no API for the spectrum. Nothing on this page is listening
 *  to the music, and anything claiming to would be lying.
 *
 *  What it does instead is keep a TEMPO CLOCK. Playback position is
 *  known to the frame, so given a tempo the beat is just arithmetic.
 *  The default is 96 BPM, which is where most of this music sits, and
 *  the Tap key sets both the real tempo and the phase — four taps and
 *  the room is on the beat, per track, remembered.
 *  ------------------------------------------------------------------ */

(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*  One flat catalogue; the decks are cuts of it, so a record lives in
      exactly one place and can belong to two decks without being stored
      twice. `now` and `era` split on year and never overlap. `badmashi`
      is the other axis — a genre mark carried on the record itself — so
      it crosses both and reaches back past where either one starts. */
  const ALL = (window.GYM && window.GYM.tracks) || [];
  /*  Each record says what it is — g under a bar, b badmashi, d floor —
      and the decks cut on those marks, not on vibes. The year decks
      require `g`, which is what stops a wedding banger from turning up in
      The Era just because it was released in 2016. */
  const DECKS = {
    now:      ALL.filter(t => t.g && t.y >= 2019),
    era:      ALL.filter(t => t.g && t.y >= 2005 && t.y <= 2018),
    badmashi: ALL.filter(t => t.b && t.y >= 2000 && t.y <= 2016),
    dance:    ALL.filter(t => t.d && t.y >= 2000),
  };
  const DECK_IDS = ['now', 'era', 'badmashi', 'dance'];
  const CUE = {
    now: 'Heavy rotation',
    era: 'On repeat, 2005–18',
    badmashi: 'Badmashi · ਬਦਮਾਸ਼ੀ',
    dance: 'Bhangra · ਭੰਗੜਾ',
  };
  const DECK_NAME = { now: 'Now', era: '2005–18',
                      badmashi: 'Badmashi 2000–16', dance: 'Dance 2000–26' };

  /*  What the corridor is made of on each deck. Now is a working shed:
      cold strip lights, hazard yellow. The Era is lit on tungsten, which
      is what a room lit in 2011 actually looked like. Badmashi is the
      same corridor after someone cut the white lights — red on rusted
      steel, and it bites harder on the downbeat. */
  const LOOK = {
    now:      { accent: [1.00, 0.80, 0.02], lamp: [0.85, 0.90, 1.00], mood: 0.00 },
    era:      { accent: [1.00, 0.60, 0.14], lamp: [1.00, 0.80, 0.52], mood: 0.38 },
    badmashi: { accent: [1.00, 0.21, 0.15], lamp: [1.00, 0.28, 0.20], mood: 1.00 },
    /*  Dance is the one room that is not iron. Same corridor, but somebody
        has patched a lighting desk into it: party drives the hue wheel in
        the shader, so every lamp bar takes its own colour and the chevrons
        run as chase lights. The accent is rani pink — the colour of every
        Punjabi wedding tent there has ever been. */
    dance:    { accent: [1.00, 0.24, 0.60], lamp: [1.00, 0.55, 0.85], mood: 0.15,
                party: 1.00 },
  };
  const DEFAULT_BPM = 96;

  /* how hard the room is allowed to hit. Reduced motion does not get a
     still page — it gets a room that lights on the beat but never moves
     the shell, never splits the type and never strobes. */
  const FORCE_CAP = REDUCED ? 0.28 : 1;

  const S = {
    deck: 'now',
    queue: [], i: 0,
    shuffle: false, playing: false, started: false,
    volume: 85, force: 0.7,
    haptics: false,
    duration: 0, elapsed: 0, seeking: false,
    dead: new Set(),
    // beat clock
    bpm: DEFAULT_BPM, phase0: 0, lastBeat: -1,
    beat: 0, bar: 0, dist: 0, roll: 0,
    shakeX: 0, shakeY: 0, kick: 0,
  };

  /* ═══ store ═════════════════════════════════════════════════════ */
  const KEY = 'loha:v1';
  const store = {
    read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} },
    patch(o) { const d = this.read(); this.write(Object.assign(d, o)); },
    bpmFor(v) { const d = this.read(); return (d.bpm || {})[v] || null; },
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
  /* every deck opens in its own fixed order, but not the same order as
     the file — otherwise the list reads as the order it was typed in */
  const orderFor = (d, list) => list.slice().sort((a, b) => hash32(d + a.v) - hash32(d + b.v));

  const live  = () => orderFor(S.deck, DECKS[S.deck].filter(t => !S.dead.has(t.v)));
  const track = () => S.queue[S.i];

  function shuffled(a) {
    const c = a.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  }

  function buildQueue(keep) {
    const list = live();
    S.queue = S.shuffle ? shuffled(list) : list;
    if (keep) {
      const n = S.queue.findIndex(t => t.v === keep.v);
      S.i = n < 0 ? 0 : n;
    } else {
      S.i = list.length ? Math.floor(Math.random() * list.length) : 0;
    }
  }

  /* ═══ the beat clock ════════════════════════════════════════════ */

  function bpmOf(t) { return (t && store.bpmFor(t.v)) || DEFAULT_BPM; }

  function armTrack(t) {
    S.bpm = bpmOf(t);
    S.phase0 = 0;
    S.lastBeat = -1;
    taps.length = 0;
    $('#bpm').textContent = Math.round(S.bpm);
    $('#k-tap').classList.toggle('is-set', !!(t && store.bpmFor(t.v)));
  }

  const taps = [];
  function tap() {
    const now = performance.now() / 1000;
    if (taps.length && now - taps[taps.length - 1] > 2.2) taps.length = 0;
    taps.push(now);
    if (taps.length > 6) taps.shift();
    if (taps.length >= 2) {
      let sum = 0;
      for (let i = 1; i < taps.length; i++) sum += taps[i] - taps[i - 1];
      const bpm = clamp(60 / (sum / (taps.length - 1)), 50, 200);
      S.bpm = bpm;
      // the tap itself is a downbeat: line the clock up with it
      S.phase0 = S.elapsed;
      S.lastBeat = -1;
      const t = track();
      if (t) { store.setBpm(t.v, Math.round(bpm)); $('#k-tap').classList.add('is-set'); }
      $('#bpm').textContent = Math.round(bpm);
    }
  }

  /* ═══ the corridor ══════════════════════════════════════════════ */

  let gpu = null;
  function startCorridor() {
    const cv = $('#bg');
    gpu = window.CORRIDOR ? window.CORRIDOR.start(cv) : null;
    if (!gpu) cv.style.display = 'none';   // let the CSS floor stand in
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    /* position */
    if (ytReady && S.playing && !S.seeking) {
      S.elapsed = yt.getCurrentTime() || 0;
      const d = yt.getDuration();
      if (d) S.duration = d;
    }

    /* beat envelope */
    const beatLen = 60 / S.bpm;
    if (S.playing) {
      const n = (S.elapsed - S.phase0) / beatLen;
      const idx = Math.floor(n);
      const ph = n - idx;
      S.beat = Math.pow(1 - ph, 3);
      S.bar  = (((idx % 4) + 4) % 4 === 0) ? Math.pow(1 - ph, 4) : 0;
      if (idx !== S.lastBeat) {          // a fresh beat just landed
        S.lastBeat = idx;
        S.kick = 1;
        const ang = Math.random() * Math.PI * 2;
        S.shakeX = Math.cos(ang); S.shakeY = Math.sin(ang);
        if (S.haptics && navigator.vibrate) {
          try { navigator.vibrate((((idx % 4) + 4) % 4 === 0) ? 22 : 9); } catch (e) {}
        }
      }
    } else {
      S.beat *= Math.pow(0.02, dt);
      S.bar  *= Math.pow(0.02, dt);
    }
    S.kick *= Math.pow(0.004, dt);

    const F = S.force * FORCE_CAP;

    /* travel: always moving, faster on the hit */
    S.dist += dt * (S.playing ? (5.5 + 13 * S.beat * F) : 0.7);
    S.roll  = Math.sin(S.dist * 0.055) * 0.05 * (0.3 + F) +
              (REDUCED ? 0 : S.kick * F * 0.035 * S.shakeX);

    if (gpu && !gpu.lost()) {
      const look = LOOK[S.deck] || LOOK.now;
      gpu.draw({ time: now / 1000, dist: S.dist, beat: S.beat, bar: S.bar,
                 force: F, roll: S.roll,
                 accent: look.accent, lamp: look.lamp,
                 mood: look.mood, party: look.party || 0 });
    }

    /*  The room takes the hit, and the type takes a smaller one. The
        controls take none: a key that moves under your finger is a key
        you miss, and the whole rack would be doing it 96 times a minute.
        The room is thrown twice as far as the type, which is what makes
        it read as the ROOM moving rather than the page wobbling. */
    const room = $('#room'), type = $('#type');
    if (REDUCED) {
      room.style.transform = '';
      type.style.transform = '';
      type.style.setProperty('--split', '0px');
    } else {
      const amp = S.kick * F * 14;
      room.style.transform =
        `translate3d(${(S.shakeX * amp).toFixed(2)}px, ${(S.shakeY * amp).toFixed(2)}px, 0)`;
      type.style.transform =
        `translate3d(${(S.shakeX * amp * -0.42).toFixed(2)}px, ${(S.shakeY * amp * -0.42).toFixed(2)}px, 0)`;
      type.style.setProperty('--split', (S.kick * F * 5).toFixed(2) + 'px');
    }
    document.documentElement.style.setProperty('--pulse', S.beat.toFixed(3));
    $('#beatbar').style.opacity = (S.kick * 0.9).toFixed(3);

    /* readouts */
    if (!S.seeking) {
      const p = S.duration ? clamp(S.elapsed / S.duration, 0, 1) : 0;
      $('#t-now').textContent = mmss(S.elapsed);
      $('#t-all').textContent = mmss(S.duration);
      $('#fill').style.width = (p * 100).toFixed(2) + '%';
      $('#beatbar').style.left = (p * 100).toFixed(2) + '%';
      const sk = $('#seek');
      sk.value = Math.round(p * 1000);
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
          if (e.data === YT.PlayerState.PLAYING) {
            S.playing = true;
            S.duration = yt.getDuration() || 0;
          } else if (e.data === YT.PlayerState.PAUSED) S.playing = false;
          else if (e.data === YT.PlayerState.ENDED) { S.playing = false; next(); }
          reflect();
        },
        // 100 / 101 / 150 — gone, private, or the label blocked embedding
        onError: () => {
          const t = track();
          if (t) S.dead.add(t.v);
          const at = S.i;
          S.queue.splice(at, 1);
          renderList();
          countUp();
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

  function paint(t) {
    $('#title').textContent = t.t;
    $('#by').textContent    = t.a || '';
    $('#year').textContent  = t.y || '';
    $('#film').textContent  = t.al || '';
    $('#cue').textContent   = CUE[S.deck] || CUE.now;
    $('#src').href = 'https://www.youtube.com/watch?v=' + t.v;
    $('#n-now').textContent = String(S.i + 1).padStart(2, '0');
    document.title = t.t + ' — Loha';
  }

  const play   = () => ytReady && yt.playVideo();
  const pause  = () => ytReady && yt.pauseVideo();
  const toggle = () => (S.playing ? pause() : play());
  const next   = () => load(S.i + 1, true);
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

  /* ═══ decks ═════════════════════════════════════════════════════ */

  function setDeck(d, force) {
    if (d === S.deck && !force) return;
    S.deck = d;
    $$('.deck-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.deck === d)));
    document.documentElement.dataset.deck = d;
    buildQueue();
    countUp();
    renderList();
    store.patch({ deck: d });
    if (S.started) load(S.i, S.playing);
    else if (track()) { paint(track()); armTrack(track()); markRow(); }
  }

  function countUp() {
    const n = live().length;
    $('#n-all').textContent = String(n).padStart(2, '0');
    $('#list-n').textContent = n;
    // the door is removed from the DOM once it has been opened, and this
    // runs again on every deck change — so it may well be gone by now
    const gn = $('#gate-n');
    if (gn) gn.textContent = ALL.length;
  }

  /* ═══ the rack ══════════════════════════════════════════════════ */

  let q = '';
  function filtered() {
    const s = q.trim().toLowerCase();
    const rows = live();
    if (!s) return rows;
    return rows.filter(t =>
      (t.t + ' ' + (t.a || '') + ' ' + (t.al || '') + ' ' + (t.y || '')).toLowerCase().includes(s));
  }

  function renderList() {
    const rows = filtered();
    $('#list-count').textContent =
      rows.length + (rows.length === 1 ? ' track' : ' tracks') + ' · ' + DECK_NAME[S.deck];
    $('#none').hidden = rows.length > 0;
    $('#rows').innerHTML = rows.map((t, n) => `
      <li><button class="row" type="button" data-v="${esc(t.v)}" aria-current="false">
        <span class="row__i">${String(n + 1).padStart(2, '0')}</span>
        <span class="row__t">${esc(t.t)}</span>
        <span class="row__a">${esc(t.a || '')}${t.y ? ' · ' + t.y : ''}</span>
        <span class="row__s">${t.s ? mmss(t.s) : '—'}</span>
      </button></li>`).join('');
    $$('#rows .row').forEach(b => b.addEventListener('click', () => pick(b.dataset.v)));
    markRow();
  }

  function pick(v) {
    const n = S.queue.findIndex(t => t.v === v);
    if (n < 0) return;
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

    $$('.deck-btn').forEach(b => b.addEventListener('click', () => setDeck(b.dataset.deck)));

    $('#k-shuffle').addEventListener('click', () => {
      S.shuffle = !S.shuffle;
      $('#k-shuffle').setAttribute('aria-pressed', String(S.shuffle));
      buildQueue(track());
      renderList();
    });

    $('#k-tap').addEventListener('click', tap);

    $('#k-haptic').addEventListener('click', () => {
      if (!navigator.vibrate) {
        $('#k-haptic').textContent = 'No haptics';
        $('#k-haptic').disabled = true;
        return;
      }
      S.haptics = !S.haptics;
      $('#k-haptic').setAttribute('aria-pressed', String(S.haptics));
      store.patch({ haptics: S.haptics });
      if (S.haptics) { try { navigator.vibrate(30); } catch (e) {} }
    });

    const seek = $('#seek');
    seek.addEventListener('pointerdown', () => { S.seeking = true; });
    seek.addEventListener('input', () => {
      const p = seek.value / 1000;
      $('#fill').style.width = (p * 100).toFixed(2) + '%';
      $('#t-now').textContent = mmss(p * S.duration);
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
    let qt;
    $('#q').addEventListener('input', e => {
      clearTimeout(qt);
      qt = setTimeout(() => { q = e.target.value; renderList(); }, 120);
    });

    addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); openList(true); return; }
      if (e.key === 'Escape') { openList(false); return; }
      if (typing) return;
      switch (e.key) {
        case ' ':          e.preventDefault(); S.started = true; toggle(); break;
        case 'ArrowRight': e.preventDefault(); next(); break;
        case 'ArrowLeft':  e.preventDefault(); prev(); break;
        case 'ArrowUp':    e.preventDefault(); setVolume(S.volume + 5); break;
        case 'ArrowDown':  e.preventDefault(); setVolume(S.volume - 5); break;
        case 's': case 'S': $('#k-shuffle').click(); break;
        case 't': case 'T': tap(); break;
        case '1': setDeck('now'); break;
        case '2': setDeck('era'); break;
        case '3': setDeck('badmashi'); break;
        case '4': setDeck('dance'); break;
      }
    });

    $('#gate-go').addEventListener('click', () => {
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
    const saved = store.read();
    if (DECK_IDS.indexOf(saved.deck) >= 0) S.deck = saved.deck;
    S.haptics = !!saved.haptics && !!navigator.vibrate;

    startCorridor();
    wire();

    setVolume(typeof saved.volume === 'number' ? saved.volume : 85);
    setForce(typeof saved.force === 'number' ? saved.force : (REDUCED ? 100 : 70));
    $('#k-haptic').setAttribute('aria-pressed', String(S.haptics));
    if (!navigator.vibrate) { $('#k-haptic').textContent = 'No haptics'; $('#k-haptic').disabled = true; }

    setDeck(S.deck, true);
    if (track()) { paint(track()); armTrack(track()); }

    loadYT();
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();
})();
