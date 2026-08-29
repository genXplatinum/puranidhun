/*  PURANI DHUN — the nine rooms
 *  ------------------------------------------------------------------
 *  A room is a palette and a sentence. Nothing else — no photographs,
 *  no scenery. What you see is the rangoli, and the rangoli takes its
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
   *  the board (#e4e2dc). Raw powder is for the rangoli's own figure,
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

  const room = (id, dial, name, deva, line, pigs) => ({
    id, dial, name, deva, line,
    pigments: pigs.map(p => PIGMENT[p]),
    inks: pigs.map(p => PIGMENT_INK[p]),
    pigmentNames: pigs,
  });

  window.PIGMENT = PIGMENT;
  window.PIGMENT_INK = PIGMENT_INK;

  window.ROOMS = [
    room('saloon-classics', 'Saloon', 'Saloon Classics', 'सैलून क्लासिक्स',
      'The chair, the mirror, the tin of talc. Songs the barber has heard so often he cuts in time to them.',
      ['peacock', 'haldi', 'sindoor']),

    room('highway-raat', 'Highway', 'Highway Raat', 'हाईवे रात',
      'Two in the morning, nothing on either side, four hundred kilometres still to go.',
      ['indigo', 'kesari', 'dhoop']),

    room('dard-90s', 'Dard', '90s Dard', 'नब्बे का दर्द',
      'One cassette, one heartbreak, rewound until the tape went thin in the middle.',
      ['jamun', 'dhoop', 'gulal']),

    room('shaadi-sunday', 'Shaadi', 'Shaadi & Sunday', 'शादी और इतवार',
      'The shutter comes down early. Somewhere down the lane a band has already started.',
      ['gulal', 'haldi', 'peacock']),

    room('desh-bhakti', 'Desh', 'Desh Bhakti', 'देशभक्ति',
      'Two mornings a year the loudspeaker on the pole wakes the whole colony, then goes quiet again.',
      ['kesari', 'neem', 'indigo']),

    room('bus-safar', 'Bus', 'Bus Safar', 'बस सफ़र',
      'Window seat, dust on the glass, the driver picking the music for forty people.',
      ['neem', 'dhoop', 'haldi']),

    // nine rooms, nine different pigments leading — no two rooms open the same colour
    room('rickshaw-galli', 'Rickshaw', 'Rickshaw Galli', 'रिक्शा गली',
      'One speaker, three wheels, every pothole between here and the market.',
      ['dhoop', 'gulal', 'haldi']),

    room('auto-galli', 'Auto', 'Auto Galli', 'ऑटो गली',
      'The signal turns red. The auto beside you is playing the same song, half a second behind.',
      ['haldi', 'neem', 'sindoor']),

    room('mistri-kaam', 'Mistri', 'Mistri Kaam', 'मिस्त्री काम',
      'A paint-flecked radio on the workbench, switched on at seven and forgotten.',
      ['sindoor', 'indigo', 'kesari']),
  ];
})();
