/*  PURANI DHUN — the transport
 *  ------------------------------------------------------------------
 *  Two reels behind a window, and the tape running between them.
 *
 *  This page used to put a generated rangoli in the middle. It was the
 *  centrepiece of a pale cement board, and when the site went dark it
 *  was the last thing still speaking the old language. A cassette is
 *  what this page is actually about — the line on the door says the tape
 *  went thin in the middle, and the rack counts tapes, not tracks.
 *
 *  ── why this is honest, and the rangoli was not ────────────────────
 *  The rangoli was seeded off the video id: pretty, deterministic, and
 *  connected to nothing. These reels are driven by the only two numbers
 *  the page genuinely knows — elapsed and duration — and they obey the
 *  real mechanics:
 *
 *    · Tape moves at a CONSTANT LINEAR SPEED, so a reel's angular speed
 *      is v/r. The supply reel starts fat and slow and visibly speeds up
 *      as it empties; the take-up reel does the opposite. Nothing about
 *      that is decoration, it is what the arithmetic gives you.
 *
 *    · A pack's AREA is proportional to the tape wound on it, so the
 *      radius goes as sqrt, not linearly:  r = √(r_hub² + f·(r_max²−r_hub²))
 *      That is why a real cassette looks nearly full for a long time and
 *      then empties in a hurry, and why this does too.
 *
 *    · Rotation is integrated from wall-clock time, and the RADII from
 *      position. So a seek spins the reels — a lot, and in the right
 *      direction — exactly as dragging a pencil through one would.
 *
 *  Nothing here is listening to the audio. That is still impossible: the
 *  player is a cross-origin iframe. But unlike a bouncing VU needle,
 *  none of this pretends otherwise.
 *  ------------------------------------------------------------------ */

window.REELS = (function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a) => {
    const e = document.createElementNS(NS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    return e;
  };

  /* the window, in viewBox units */
  const W = 1000, H = 500;
  const LX = 296, RX = 704, CY = 214;     /* reel centres */
  const R_HUB = 62, R_MAX = 182;          /* bare hub, and a full pack */
  const TAPE_Y = 432;                     /* where the tape runs past the head */

  /*  Constant linear tape speed, in viewBox units per second. Picked so a
      full pack turns about a third of a revolution per second and a bare
      hub turns about one — which is roughly what a C-60 looks like, and
      more to the point is fast enough to read as motion and slow enough
      not to strobe. */
  const V = 640;

  const packR = f => Math.sqrt(R_HUB * R_HUB + f * (R_MAX * R_MAX - R_HUB * R_HUB));

  /* a hub: six prongs, the way every cassette hub since 1963 has had */
  function hubPath() {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x = Math.cos(a), y = Math.sin(a);
      const px = -y, py = x;                       /* perpendicular */
      const r0 = 20, r1 = R_HUB - 5, hw = 7;
      d += `M${(x * r0 + px * hw).toFixed(1)},${(y * r0 + py * hw).toFixed(1)}`
         + `L${(x * r1 + px * hw * 0.62).toFixed(1)},${(y * r1 + py * hw * 0.62).toFixed(1)}`
         + `L${(x * r1 - px * hw * 0.62).toFixed(1)},${(y * r1 - py * hw * 0.62).toFixed(1)}`
         + `L${(x * r0 - px * hw).toFixed(1)},${(y * r0 - py * hw).toFixed(1)}Z`;
    }
    return d;
  }

  /*  Wound tape is CONCENTRIC. The first version drew a fan of radial
      spokes, which turns out to look like a turbine — you can see the
      mistake the moment it is next to a real reel. So: fine rings for the
      winding, which are rotationally symmetric and therefore say nothing
      about motion, and a HANDFUL of radial flaws, which say all of it.
      That is also how you read a real reel across a room. */
  function winding(seed) {
    const g = el('g', {});
    let s = seed >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    /* the rings do not rotate — nothing would change if they did */
    for (let r = R_HUB + 4; r < R_MAX; r += 3.1 + rnd() * 2.4) {
      g.appendChild(el('circle', {
        class: 'rl-ring', r: r.toFixed(1),
        opacity: (0.05 + rnd() * 0.09).toFixed(3),
      }));
    }
    return g;
  }
  function flaws(seed) {
    const g = el('g', { class: 'rl-flaws' });
    let s = seed >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * 360 + rnd() * 44;
      const r0 = R_HUB + 6 + rnd() * 40, r1 = r0 + 26 + rnd() * 74;
      g.appendChild(el('line', {
        x1: 0, y1: -r0, x2: 0, y2: -Math.min(r1, R_MAX),
        transform: `rotate(${a.toFixed(2)})`,
        class: 'rl-flaw', opacity: (0.24 + rnd() * 0.4).toFixed(2),
      }));
    }
    /* the leader: one bright mark, so there is always something to track */
    g.appendChild(el('line', {
      x1: 0, y1: -(R_HUB + 3), x2: 0, y2: -R_MAX,
      class: 'rl-leader', transform: 'rotate(0)',
    }));
    return g;
  }

  function reel(side) {
    const cx = side === 'l' ? LX : RX;
    const g = el('g', { transform: `translate(${cx},${CY})` });

    g.appendChild(el('circle', { class: 'rl-well', r: R_MAX + 13 }));
    const pack = el('circle', { class: 'rl-pack', r: R_MAX });
    g.appendChild(pack);

    const clip = el('clipPath', { id: `rl-clip-${side}` });
    const clipC = el('circle', { r: R_MAX });
    clip.appendChild(clipC);
    g.appendChild(clip);

    const seed = side === 'l' ? 0x5eed : 0xb0a7;
    const inner = el('g', { 'clip-path': `url(#rl-clip-${side})` });
    inner.appendChild(winding(seed));           /* static: symmetric */
    const st = flaws(seed ^ 0x9e37);            /* turns: asymmetric */
    inner.appendChild(st);
    g.appendChild(inner);

    const edge = el('circle', { class: 'rl-edge', r: R_MAX });
    g.appendChild(edge);

    const hub = el('g', { class: 'rl-hub' });
    hub.appendChild(el('circle', { class: 'rl-hub-well', r: R_HUB }));
    hub.appendChild(el('path', { class: 'rl-teeth', d: hubPath() }));
    hub.appendChild(el('circle', { class: 'rl-spindle', r: 15 }));
    g.appendChild(hub);

    return { g, pack, clipC, edge, spin: st, hub, cx };
  }

  return {
    /*  Build once. Returns a handle the page drives every frame; the DOM
        under it is never rebuilt, only its numbers rewritten. */
    mount(svg) {
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = '';

      const root = el('g', {});
      const L = reel('l'), R = reel('r');

      /* the tape path is drawn under the reels so it tucks behind them */
      const tape  = el('path', { class: 'rl-tape' });
      const sheen = el('path', { class: 'rl-tape-sheen' });
      root.appendChild(tape);
      root.appendChild(sheen);
      root.appendChild(L.g);
      root.appendChild(R.g);

      /*  The head. It does not do anything — but a tape running past
          nothing at all looks like a mistake, and this is where the
          room's colour gets to sit on the metal. */
      const head = el('g', { class: 'rl-head', transform: `translate(500,${TAPE_Y})` });
      head.appendChild(el('rect', { class: 'rl-head-body', x: -40, y: -34, width: 80, height: 46, rx: 3 }));
      head.appendChild(el('rect', { class: 'rl-head-gap',  x: -1.8, y: -34, width: 3.6, height: 46 }));
      root.appendChild(head);

      for (const x of [LX, RX]) {
        const r = el('g', { class: 'rl-roller', transform: `translate(${x},${TAPE_Y})` });
        r.appendChild(el('circle', { class: 'rl-roller-o', r: 15 }));
        r.appendChild(el('circle', { class: 'rl-roller-i', r: 5 }));
        root.appendChild(r);
      }

      svg.appendChild(root);

      const st = { th: 0, p: 0, L, R, tape, sheen };

      function geom(p) {
        const rs = packR(1 - p), rt = packR(p);
        L.pack.setAttribute('r', rs.toFixed(1));
        L.clipC.setAttribute('r', rs.toFixed(1));
        L.edge.setAttribute('r', rs.toFixed(1));
        R.pack.setAttribute('r', rt.toFixed(1));
        R.clipC.setAttribute('r', rt.toFixed(1));
        R.edge.setAttribute('r', rt.toFixed(1));
        /* the tape leaves each pack at its lowest point, so the path has
           to be redrawn as the packs grow and shrink */
        const ly = CY + rs, ry = CY + rt;
        /*  Down the inside of each pack to a guide roller directly below
            it, then straight across past the head. The drop shortens as a
            pack fattens, which is the detail that sells it. */
        const d = `M${LX},${ly.toFixed(1)} L${LX},${TAPE_Y - 20}`
                + ` Q${LX},${TAPE_Y} ${LX + 20},${TAPE_Y}`
                + ` L${RX - 20},${TAPE_Y}`
                + ` Q${RX},${TAPE_Y} ${RX},${TAPE_Y - 20}`
                + ` L${RX},${ry.toFixed(1)}`;
        tape.setAttribute('d', d);
        sheen.setAttribute('d', d);
        return { rs, rt };
      }

      const handle = {
        /*  dt is wall-clock seconds and drives ROTATION; p is position and
            drives the RADII. Keeping them separate is what makes a seek
            spin the reels instead of teleporting them. */
        frame(p, dt, running) {
          p = Math.min(1, Math.max(0, p || 0));
          const { rs, rt } = geom(p);
          if (running && dt > 0) st.th += (V * dt) / Math.max(rs, R_HUB);
          /* a seek moves tape too — a lot of it, all at once */
          const dp = p - st.p;
          if (Math.abs(dp) > 0.004) st.th += dp * 1400 / Math.max(rs, R_HUB);
          st.p = p;
          const a = (st.th * 57.29577951).toFixed(2);
          L.spin.setAttribute('transform', `rotate(${a})`);
          L.hub.setAttribute('transform',  `rotate(${a})`);
          /*  Both reels turn the same way — the tape is one ribbon. The
              take-up reel turns SLOWER as it fattens, so it gets its own
              integration rather than sharing the supply reel's angle. */
          st.thT = (st.thT || 0) + (running && dt > 0 ? (V * dt) / Math.max(rt, R_HUB) : 0)
                 + (Math.abs(dp) > 0.004 ? dp * 1400 / Math.max(rt, R_HUB) : 0);
          const b = (st.thT * 57.29577951).toFixed(2);
          R.spin.setAttribute('transform', `rotate(${b})`);
          R.hub.setAttribute('transform',  `rotate(${b})`);
        },
        /* a new tape: everything rewound, the angle left where it was —
           a fresh cassette does not start on a fixed spoke */
        reset(p) { st.p = p || 0; geom(st.p); },
      };
      geom(0);
      return handle;
    },

    /* a still transport for the door, at whatever position looks best */
    still(svg, p) {
      const h = this.mount(svg);
      h.frame(p == null ? 0.34 : p, 0, false);
      return h;
    },
  };
})();
