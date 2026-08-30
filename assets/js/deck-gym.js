/*  The gym room's configuration for the Loha engine.
 *  ------------------------------------------------------------------
 *  Four cuts of one Punjabi catalogue. `now` and `era` split on year and
 *  never overlap; `badmashi` and `dance` are the other axis — genre marks
 *  carried on the record itself — so they cross both. The year decks
 *  require `g`, which is what stops a wedding banger from turning up in
 *  The Era just because it came out in 2016.
 *
 *  What the corridor is made of on each deck. Now is a working shed: cold
 *  strip lights, hazard yellow. The Era is lit on tungsten, which is what
 *  a room lit in 2011 actually looked like. Badmashi is the same corridor
 *  after someone cut the white lights. Dance is the one room that is not
 *  iron — somebody has patched a lighting desk into it, so `party` drives
 *  the hue wheel and the chevrons run as chase lights.
 *  ------------------------------------------------------------------ */
window.LOHA_CONF = {
  store: 'loha:v1',
  title: 'Loha',
  bpm: 96,
  tracks: () => (window.GYM && window.GYM.tracks) || [],
  decks: [
    { id: 'now',      name: 'Now',              cue: 'Heavy rotation',
      pick: t => t.g && t.y >= 2019,
      look: { accent: [1.00, 0.80, 0.02], lamp: [0.85, 0.90, 1.00], mood: 0.00 } },

    { id: 'era',      name: '2005–18',          cue: 'On repeat, 2005–18',
      pick: t => t.g && t.y >= 2005 && t.y <= 2018,
      look: { accent: [1.00, 0.60, 0.14], lamp: [1.00, 0.80, 0.52], mood: 0.38 } },

    { id: 'badmashi', name: 'Badmashi 2000–16', cue: 'Badmashi',
      pick: t => t.b && t.y >= 2000 && t.y <= 2016,
      look: { accent: [1.00, 0.21, 0.15], lamp: [1.00, 0.28, 0.20], mood: 1.00 } },

    { id: 'dance',    name: 'Dance 2000–26',    cue: 'Bhangra',
      pick: t => t.d && t.y >= 2000,
      look: { accent: [1.00, 0.24, 0.60], lamp: [1.00, 0.55, 0.85], mood: 0.15,
              party: 1.00 } },
  ],
};
