/*  LOHA — the corridor
 *  ------------------------------------------------------------------
 *  A WebGL tunnel, drawn as one full-screen fragment shader. There is
 *  no geometry and no library: for a box tunnel the wall a ray lands on
 *  can be solved outright — t = min(halfWidth/|d.x|, halfHeight/|d.y|)
 *  — so this is a plain intersection, not a raymarch, and it holds 60fps
 *  on a phone.
 *
 *  Everything that moves is driven from outside by loha.js:
 *    dist    how far down the corridor we have travelled
 *    beat    1 on the beat, decaying
 *    bar     1 on the downbeat, decaying harder
 *    force   0..1, how much the room is allowed to react
 *    roll    camera roll, radians
 *    accent  the hazard paint on the walls
 *    lamp    what the strip lights are burning
 *    mood    0 clean steel .. 1 rust and blood
 *
 *  The last three are what makes the corridor a different place on each
 *  deck: cold white and hazard yellow for Now, tungsten and amber for
 *  the Era, red on rusted steel for Badmashi.
 *  ------------------------------------------------------------------ */

window.CORRIDOR = (function () {
  'use strict';

  const VERT = `
    attribute vec2 a;
    void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

  const FRAG = `
  precision highp float;
  uniform vec2  uRes;
  uniform float uTime, uDist, uBeat, uBar, uForce, uRoll, uMood;
  uniform vec3  uAccent, uLamp;

  mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  float hash21(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    uv *= rot(uRoll);

    /* a wider lens as the room gets louder — it reads as the walls
       rushing you rather than the camera speeding up */
    vec3 rd = normalize(vec3(uv, 1.35 - 0.22 * uBeat * uForce));

    /* the corridor squeezes on every hit */
    float hw = 0.62 - 0.05 * uBeat * uForce;
    float hh = 0.42 - 0.035 * uBeat * uForce;

    float tx = hw / max(abs(rd.x), 1e-4);
    float ty = hh / max(abs(rd.y), 1e-4);
    float t  = min(tx, ty);
    float sideWall = step(tx, ty);              /* 1 side, 0 floor or roof */
    float roof     = (1.0 - sideWall) * step(0.0, rd.y);

    vec3  p = rd * t;
    float z = p.z + uDist;
    float across = mix(p.x / hw, p.y / hh, sideWall);   /* -1 .. 1 */

    /* ── the steel itself ─────────────────────────────────────── */
    /* cold rolled steel, or the same steel gone rusty and warm */
    vec3 col = mix(vec3(0.052, 0.058, 0.070), vec3(0.075, 0.050, 0.046), uMood);
    col *= 0.86 + 0.14 * sin(z * 12.566);                /* corrugation */
    col += 0.055 * smoothstep(0.05, 0.0, abs(fract(z * 0.5) - 0.5));
    col += 0.030 * smoothstep(0.02, 0.0, abs(fract(across * 2.5) - 0.5));

    /* grime, so the flat panels are not perfectly flat */
    col *= 0.80 + 0.20 * hash21(floor(vec2(z * 3.0, across * 9.0)));

    /* ── ribs: a frame every four units, lit on its leading edge ─ */
    float rf  = fract(z * 0.25);
    float rib = smoothstep(0.034, 0.0, rf) + smoothstep(0.966, 1.0, rf);
    col = mix(col, mix(vec3(0.145, 0.158, 0.182),
                       vec3(0.150, 0.098, 0.090), uMood), rib);
    /*  A lit edge on the leading face of each rib. This is the detail that
        actually sells the forward motion — but it takes the room's own
        temperature, or the near frame reads as a cold blue box hanging in
        the middle of a red corridor. */
    col += mix(vec3(0.16, 0.18, 0.22), vec3(0.24, 0.10, 0.08), uMood)
                 * smoothstep(0.012, 0.0, rf)
                 * smoothstep(1.0, 6.0, p.z);

    /* ── hazard chevrons, low on both side walls ────────────────── */
    float band = sideWall * smoothstep(0.085, 0.02, abs(across + 0.66));
    float chev = step(0.5, fract(z * 0.9 + 0.5));
    vec3  haz  = mix(uAccent, vec3(0.05, 0.045, 0.02), chev);
    col = mix(col, haz * (0.55 + 0.9 * uBeat * uForce), band);

    /* ── strip lights along the roof, every three units ──────────── */
    /*  Lamps only count once they are some way down the corridor. The one
        directly overhead has a tiny t, so at full strength it blows the
        top of the screen into a white sheet and the tunnel stops reading
        as a tunnel. Fading the near field also does the work of making
        the lights appear to rush toward you. */
    float ahead = smoothstep(0.6, 4.5, p.z);
    float lf   = abs(fract(z / 3.0) - 0.5);
    float lamp = roof * smoothstep(0.075, 0.0, lf)
                      * smoothstep(0.60, 0.14, abs(across)) * ahead;
    vec3 lampC = mix(uLamp, vec3(1.00, 0.17, 0.10), uBar * uForce);
    col += lampC * lamp * (1.7 + 2.8 * uBeat * uForce);

    /* their spill down the walls, and the wet bounce off the floor */
    float spill = smoothstep(0.55, 0.0, lf) * (0.14 + 0.30 * uBeat * uForce) * ahead;
    col += lampC * spill * (0.30 + 0.70 * (1.0 - abs(across)));
    float floorY = (1.0 - sideWall) * (1.0 - step(0.0, rd.y));
    col += lampC * floorY * smoothstep(0.30, 0.0, lf) * 0.5 * ahead
                 * (0.5 + 0.5 * uBeat * uForce);

    /* ── the wash on the downbeat ───────────────────────────────── */
    col += mix(vec3(0.55, 0.045, 0.03), vec3(0.85, 0.030, 0.020), uMood)
                 * uBar * uForce * (0.85 + 0.5 * uMood)
                 * smoothstep(1.1, 0.0, length(uv));

    /* ── depth ──────────────────────────────────────────────────── */
    float fog = exp(-t * 0.145);
    col *= fog;
    col += mix(vec3(0.020, 0.024, 0.034), vec3(0.040, 0.014, 0.012), uMood)
                 * (1.0 - fog);                          /* haze */

    /* dust caught in the lamps */
    float m = hash21(floor(vec2(uv.x * 190.0, uv.y * 190.0 - uTime * 24.0)));
    col += vec3(0.9, 0.88, 0.8) * step(0.9988, m) * (0.25 + 0.55 * uBeat);

    /* ── grade ──────────────────────────────────────────────────── */
    col = pow(max(col, 0.0), vec3(0.88));
    col *= 1.0 - (0.55 + 0.22 * uMood) * dot(uv, uv);    /* vignette */
    col = mix(col, vec3(dot(col, vec3(0.299, 0.587, 0.114))), -0.12);

    gl_FragColor = vec4(col, 1.0);
  }`;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('corridor:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  return {
    /* returns null when WebGL is unavailable — the caller then leaves the
       CSS floor showing rather than a black hole */
    start(canvas) {
      const gl = canvas.getContext('webgl', {
        alpha: false, antialias: false, depth: false, stencil: false,
        powerPreference: 'high-performance',
      }) || canvas.getContext('experimental-webgl');
      if (!gl) return null;

      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return null;

      const pr = gl.createProgram();
      gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        console.warn('corridor:', gl.getProgramInfoLog(pr));
        return null;
      }
      gl.useProgram(pr);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const U = {};
      ['uRes','uTime','uDist','uBeat','uBar','uForce','uRoll','uMood','uAccent','uLamp']
        .forEach(n => { U[n] = gl.getUniformLocation(pr, n); });

      let w = 0, h = 0;
      /*  A full-screen shader is fill-rate bound, so it is drawn at a
          capped pixel ratio rather than the device's own. Above 2x there
          is nothing left to see and a phone just gets hot. */
      function size() {
        const dpr = Math.min(devicePixelRatio || 1, 1.75);
        const nw = Math.round(canvas.clientWidth  * dpr);
        const nh = Math.round(canvas.clientHeight * dpr);
        if (nw === w && nh === h) return;
        w = canvas.width = nw; h = canvas.height = nh;
        gl.viewport(0, 0, w, h);
      }

      return {
        lost: () => gl.isContextLost(),
        draw(s) {
          size();
          if (!w || !h) return;
          gl.uniform2f(U.uRes, w, h);
          gl.uniform1f(U.uTime,  s.time);
          gl.uniform1f(U.uDist,  s.dist);
          gl.uniform1f(U.uBeat,  s.beat);
          gl.uniform1f(U.uBar,   s.bar);
          gl.uniform1f(U.uForce, s.force);
          gl.uniform1f(U.uRoll,  s.roll);
          gl.uniform1f(U.uMood,  s.mood);
          gl.uniform3fv(U.uAccent, s.accent);
          gl.uniform3fv(U.uLamp,   s.lamp);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        },
      };
    },
  };
})();
