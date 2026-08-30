/*  The worldwide room's configuration for the Loha engine.
 *  ------------------------------------------------------------------
 *  The gym room cuts its decks on years because Punjabi gym music has a
 *  before and an after. This catalogue runs 1970 to 2022, so a year cut
 *  would say nothing — these decks cut on what a record IS, which is the
 *  mark `k` carried on the record itself.
 *
 *  The gym room owns the warm half of the wheel: hazard yellow, tungsten
 *  amber, red, rani pink. So this one takes the cold half and one acid
 *  green, and the two pages never look like each other by accident.
 *
 *      iron   chalk on concrete, bare fluorescent, no colour at all
 *      rap    the lights cut to violet; `mood` warms the steel behind it
 *      volt   the lighting rig, same as Dance — this is festival music
 *      rise   safety green, the colour of the sign above the fire door
 *  ------------------------------------------------------------------ */
window.LOHA_CONF = {
  store: 'max:v1',
  title: 'Max',
  /*  Faster than the gym room's 96. Western gym records sit nearer 120,
      and the tempo is only ever a starting guess — Tap sets the truth. */
  bpm: 120,
  tracks: () => (window.MAX && window.MAX.tracks) || [],
  /*  The plates carry the genre, so the cue carries what the deck is FOR.
      Repeating "Rock & metal" under a plate that already says it wasted
      the one line of type nearest the title — and wrapped on a phone. */
  decks: [
    { id: 'iron', name: 'Iron', cue: 'The barbell',
      pick: t => t.k === 'iron',
      look: { accent: [0.91, 0.94, 0.96], lamp: [0.86, 0.92, 1.00], mood: 0.00 } },

    { id: 'rap',  name: 'Rap',  cue: 'The bench',
      pick: t => t.k === 'rap',
      look: { accent: [0.63, 0.48, 1.00], lamp: [0.70, 0.55, 1.00], mood: 0.55 } },

    { id: 'volt', name: 'Volt', cue: 'Conditioning',
      pick: t => t.k === 'volt',
      look: { accent: [0.13, 0.88, 1.00], lamp: [0.45, 0.92, 1.00], mood: 0.05,
              party: 1.00 } },

    { id: 'rise', name: 'Rise', cue: 'The last set',
      pick: t => t.k === 'rise',
      look: { accent: [0.65, 1.00, 0.24], lamp: [0.78, 1.00, 0.52], mood: 0.20 } },
  ],
};
