/*  PURANI DHUN — the rangoli engine
 *  ------------------------------------------------------------------
 *  A rangoli is drawn on a grid of dots, in radial symmetry, in loose
 *  powder, and it is gone by evening. This one is drawn from a song:
 *  the video id seeds the geometry, so every record in the catalogue
 *  has its own figure, the same one every time you play it.
 *
 *  What the seed decides
 *    · how many times the motif repeats around the circle (the fold)
 *    · how many rings, and which motif sits on each
 *    · which of the room's pigments each ring is drawn in
 *    · stroke weights, and which way each ring turns
 *
 *  What the room decides
 *    · the pigments themselves
 *
 *  What playback decides
 *    · whether the rings are turning
 *    · how far round the outer ring has filled
 *  ------------------------------------------------------------------ */

(function () {
  'use strict';

  const C = 500;            // centre of the 1000×1000 viewBox
  const TAU = Math.PI * 2;

  /* ── a small deterministic generator ──────────────────────────────
     mulberry32: same seed in, same rangoli out, every single time. */
  function seedFrom(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const between = (r, lo, hi) => lo + r() * (hi - lo);

  const P = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const at = (ang, rad) => [C + Math.cos(ang) * rad, C + Math.sin(ang) * rad];

  /* ── the motifs ───────────────────────────────────────────────────
     Each returns the markup for one ring: a motif repeated `n` times
     around the circle at radius `r`. They are deliberately simple —
     a rangoli is made of very few marks, repeated exactly. */

  const MOTIF = {
    // the dot grid a rangoli is laid out on
    dots(n, r, o) {
      let s = '';
      for (let i = 0; i < n; i++) {
        const [x, y] = at((i / n) * TAU + o.phase, r);
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${o.w * 1.6}" fill="${o.color}"/>`;
      }
      return s;
    },

    // the lotus petal — two arcs meeting at a point
    petal(n, r, o) {
      const len = r * between(o.r, 0.3, 0.46);
      const wide = len * between(o.r, 0.34, 0.62);
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + o.phase;
        const deg = (a * 180) / Math.PI + 90;
        s += `<path d="M0 0 C ${P(-wide, -len * 0.55)} ${P(-wide * 0.5, -len)} 0 ${(-len).toFixed(1)}
                       C ${P(wide * 0.5, -len)} ${P(wide, -len * 0.55)} 0 0 Z"
                 transform="translate(${at(a, r - len * 0.1).map(v => v.toFixed(1)).join(',')}) rotate(${deg.toFixed(1)})"
                 fill="${o.fill}" stroke="${o.color}" stroke-width="${o.w}" stroke-linejoin="round"/>`;
      }
      return s;
    },

    // teardrops pointing outward
    drop(n, r, o) {
      const len = r * between(o.r, 0.18, 0.3);
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + o.phase;
        const deg = (a * 180) / Math.PI + 90;
        s += `<path d="M0 ${(-len).toFixed(1)} Q ${P(len * 0.62, 0)} 0 ${(len * 0.5).toFixed(1)}
                       Q ${P(-len * 0.62, 0)} 0 ${(-len).toFixed(1)} Z"
                 transform="translate(${at(a, r).map(v => v.toFixed(1)).join(',')}) rotate(${deg.toFixed(1)})"
                 fill="${o.fill}" stroke="${o.color}" stroke-width="${o.w}"/>`;
      }
      return s;
    },

    // scalloped arcs, the looping line a kolam is really made of
    scallop(n, r, o) {
      const step = TAU / n;
      let d = '';
      for (let i = 0; i < n; i++) {
        const a0 = i * step + o.phase, a1 = a0 + step;
        const [x0, y0] = at(a0, r);
        const [x1, y1] = at(a1, r);
        const bulge = r * between(o.r, 1.12, 1.3);
        const [mx, my] = at(a0 + step / 2, bulge);
        d += `${i ? '' : `M${P(x0, y0)}`} Q ${P(mx, my)} ${P(x1, y1)} `;
      }
      return `<path d="${d}Z" fill="${o.fill}" stroke="${o.color}" stroke-width="${o.w}" stroke-linejoin="round"/>`;
    },

    // diamonds standing on their points
    diamond(n, r, o) {
      const h = r * between(o.r, 0.13, 0.22);
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + o.phase;
        const deg = (a * 180) / Math.PI;
        s += `<rect x="${(-h / 2).toFixed(1)}" y="${(-h / 2).toFixed(1)}" width="${h.toFixed(1)}" height="${h.toFixed(1)}"
                 transform="translate(${at(a, r).map(v => v.toFixed(1)).join(',')}) rotate(${(deg + 45).toFixed(1)})"
                 fill="${o.fill}" stroke="${o.color}" stroke-width="${o.w}"/>`;
      }
      return s;
    },

    // radial ticks, like the rays around a sun motif
    ray(n, r, o) {
      const len = r * between(o.r, 0.1, 0.2);
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + o.phase;
        const [x0, y0] = at(a, r - len / 2);
        const [x1, y1] = at(a, r + len / 2);
        s += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"
                 stroke="${o.color}" stroke-width="${o.w * 1.7}" stroke-linecap="round"/>`;
      }
      return s;
    },

    // a plain circle — the pause between two busy rings
    band(n, r, o) {
      return `<circle cx="${C}" cy="${C}" r="${r.toFixed(1)}" fill="none"
                stroke="${o.color}" stroke-width="${o.w * 1.3}"
                ${o.dashed ? `stroke-dasharray="${(r * 0.08).toFixed(1)} ${(r * 0.05).toFixed(1)}"` : ''}/>`;
    },

    // interlocking chevrons
    chevron(n, r, o) {
      const h = r * between(o.r, 0.12, 0.2);
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + o.phase;
        const deg = (a * 180) / Math.PI + 90;
        s += `<path d="M${P(-h, h * 0.6)} L 0 ${(-h * 0.6).toFixed(1)} L ${P(h, h * 0.6)}"
                 transform="translate(${at(a, r).map(v => v.toFixed(1)).join(',')}) rotate(${deg.toFixed(1)})"
                 fill="none" stroke="${o.color}" stroke-width="${o.w * 1.5}"
                 stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return s;
    },
  };

  const OUTER = ['scallop', 'petal', 'drop', 'chevron'];
  const MID   = ['petal', 'diamond', 'drop', 'dots', 'chevron'];
  const INNER = ['dots', 'ray', 'diamond', 'band'];

  /* ── compose one rangoli ──────────────────────────────────────────
     Returns { svg, fold, rings, motifs } — the markup plus a short
     description of what was drawn, which the page prints as a caption. */
  function build(key, pigments) {
    const r = rng(seedFrom(key));
    const fold = pick(r, [6, 8, 8, 10, 12, 12, 16]);
    const ringCount = 4 + Math.floor(r() * 2);          // 4 or 5
    const outerR = 400;
    const inks = pigments.slice();

    let rings = [];
    let usedMotifs = [];

    for (let i = 0; i < ringCount; i++) {
      const t = i / (ringCount - 1);                     // 0 inner … 1 outer
      const radius = outerR * (0.2 + 0.8 * t);
      const pool = t > 0.72 ? OUTER : t > 0.34 ? MID : INNER;
      const name = pick(r, pool);
      const color = inks[Math.floor(r() * inks.length)];
      const solid = r() > 0.55;
      // the fold doubles on the outer rings, the way real rangolis crowd outward
      const n = t > 0.6 ? fold * (r() > 0.5 ? 2 : 1) : fold;

      const body = MOTIF[name](Math.max(3, Math.round(n)), radius, {
        color,
        fill: solid ? color : 'none',
        w: between(r, 3, 7),
        phase: r() * TAU,
        dashed: r() > 0.6,
        r,
      });

      usedMotifs.push(name);
      rings.push(
        `<g class="rg-ring${i % 2 ? ' rg-ring--rev' : ''}" style="--i:${i};--spin:${(26 + i * 9).toFixed(0)}s">${body}</g>`
      );
    }

    // the bindu: the dot every rangoli starts from, and a record's spindle
    const dot = inks[0];
    rings.push(
      `<g class="rg-bindu">
         <circle cx="${C}" cy="${C}" r="34" fill="${dot}" opacity=".12"/>
         <circle cx="${C}" cy="${C}" r="15" fill="${dot}"/>
         <circle cx="${C}" cy="${C}" r="4.5" fill="var(--ground)"/>
       </g>`
    );

    return {
      svg: rings.join(''),
      fold,
      rings: ringCount,
      motifs: [...new Set(usedMotifs)],
    };
  }

  window.RANGOLI = { build, seedFrom, rng };
})();
