/*  PURANI DHUN — the nine rooms
 *  ------------------------------------------------------------------
 *  A room is a palette and a sentence. Nothing else — no photographs,
 *  no scenery. What you see is the transport, and the transport takes its
 *  colours from whichever room the dial is pointing at.
 *
 *  Pigments are named for what they actually are: haldi is turmeric,
 *  sindoor is vermilion, gulal is the powder thrown at Holi, neem is
 *  leaf green, jamun is the fruit, kesari is saffron.
 *  ------------------------------------------------------------------ */

(function () {
  'use strict';

  const PIGMENT = {
    haldi:   '#f2b01e',
    sindoor: '#e03e3e',
    kesari:  '#ef6c1a',
    gulal:   '#e2418b',
    jamun:   '#7038a8',
    indigo:  '#2e44ad',
    dhoop:   '#0d9bc4',
    peacock: '#00887c',
    neem:    '#5c9128',
  };

  /*  The same nine pigments, darkened until each clears 4.5:1 against
   *  the board (#e4e2dc). Raw powder is for a figure drawn on it,
   *  where the shapes are large and saturation is the point. Anything
   *  you have to READ — the progress ring, a numeral, a live label —
   *  takes the ink instead.
   *
   *  This is not a nicety. Raw haldi on the board is 1.47:1, kesari
   *  2.37 and dhoop 2.49, and two of the nine rooms (Auto Galli and
   *  Rickshaw Galli) lead with one of those. Their progress ring used
   *  to be all but invisible.
   */
  /*  Ratios below are the WORST case across all ten grounds the page can
   *  paint — the bare board plus the nine room washes — because the wash
   *  darkens the board slightly and eats a little contrast with it.
   */
  const PIGMENT_INK = {
    haldi:   '#7b5a0f',  /* 4.59:1 */
    sindoor: '#b13131',  /* 4.53:1 */
    kesari:  '#9e4711',  /* 4.51:1 */
    gulal:   '#a93168',  /* 4.55:1 */
    jamun:   '#7038a8',  /* 5.38:1 — already clears it, left alone */
    indigo:  '#2e44ad',  /* 5.96:1 — already clears it, left alone */
    dhoop:   '#096883',  /* 4.58:1 */
    peacock: '#006d63',  /* 4.52:1 */
    neem:    '#436a1d',  /* 4.58:1 */
  };

  /*  The same nine again, this time lifted until each clears 4.5:1
   *  against the DARK ground (#08090b) the site now runs on.
   *
   *  It is the mirror of PIGMENT_INK and it catches the opposite end of
   *  the nine. On the pale board the problem children were the bright
   *  ones — haldi at 1.47:1, kesari 2.37, dhoop 2.49 — and they had to be
   *  darkened. On black it is the deep ones that vanish: jamun is 2.67:1
   *  and indigo 2.42:1 raw. Six of the nine are already legible on black
   *  and are left exactly as they are; lifting a colour that does not
   *  need it only washes the room out.
   *
   *  Hue and saturation are held; only lightness moves.
   */
  const PIGMENT_GLOW = {
    haldi:   '#f2b01e',  /* 10.44:1 — left alone */
    sindoor: '#e03e3e',  /*  4.67:1 — left alone */
    kesari:  '#ef6c1a',  /*  6.48:1 — left alone */
    gulal:   '#e2418b',  /*  5.09:1 — left alone */
    jamun:   '#9661ca',  /*  4.61:1 — lifted from #7038a8 (2.67:1) */
    indigo:  '#5e73d4',  /*  4.63:1 — lifted from #2e44ad (2.42:1) */
    dhoop:   '#0d9bc4',  /*  6.17:1 — left alone */
    peacock: '#00897d',  /*  4.62:1 — one step up from #00887c */
    neem:    '#5c9128',  /*  5.25:1 — left alone */
  };

  const room = (id, dial, name, line, pigs) => ({
    id, dial, name, line,
    pigments: pigs.map(p => PIGMENT[p]),
    inks: pigs.map(p => PIGMENT_INK[p]),
    glow: pigs.map(p => PIGMENT_GLOW[p]),
    pigmentNames: pigs,
  });

  window.PIGMENT = PIGMENT;
  window.PIGMENT_INK = PIGMENT_INK;
  window.PIGMENT_GLOW = PIGMENT_GLOW;

  window.ROOMS = [
    room('saloon-classics', 'Saloon', 'Saloon Classics', 'The chair, the mirror, the tin of talc. Songs the barber has heard so often he cuts in time to them.',
      ['peacock', 'haldi', 'sindoor']),

    room('highway-raat', 'Highway', 'Highway Raat', 'Two in the morning, nothing on either side, four hundred kilometres still to go.',
      ['indigo', 'kesari', 'dhoop']),

    room('dard-90s', 'Dard', '90s Dard', 'One cassette, one heartbreak, rewound until the tape went thin in the middle.',
      ['jamun', 'dhoop', 'gulal']),

    room('shaadi-sunday', 'Shaadi', 'Shaadi & Sunday', 'The shutter comes down early. Somewhere down the lane a band has already started.',
      ['gulal', 'haldi', 'peacock']),

    room('desh-bhakti', 'Desh', 'Desh Bhakti', 'Two mornings a year the loudspeaker on the pole wakes the whole colony, then goes quiet again.',
      ['kesari', 'neem', 'indigo']),

    room('bus-safar', 'Bus', 'Bus Safar', 'Window seat, dust on the glass, the driver picking the music for forty people.',
      ['neem', 'dhoop', 'haldi']),

    // nine rooms, nine different pigments leading — no two rooms open the same colour
    room('rickshaw-galli', 'Rickshaw', 'Rickshaw Galli', 'One speaker, three wheels, every pothole between here and the market.',
      ['dhoop', 'gulal', 'haldi']),

    room('auto-galli', 'Auto', 'Auto Galli', 'The signal turns red. The auto beside you is playing the same song, half a second behind.',
      ['haldi', 'neem', 'sindoor']),

    room('mistri-kaam', 'Mistri', 'Mistri Kaam', 'A paint-flecked radio on the workbench, switched on at seven and forgotten.',
      ['sindoor', 'indigo', 'kesari']),
  ];
})();
