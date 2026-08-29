# Purani Dhun — पुरानी धुन

369 old Hindi and Punjabi records in nine rooms. Every song draws its own
rangoli, and the rangoli is the record: its rings turn while the tape runs
and the circle around the outside is how far through you are.

Audio streams from each track's own YouTube source. Nothing is hosted here
and the picture stays off.

Made with ♥ by **[Love Lace Designing Studio](https://lovelace.co.in)**.

---

## Where it lives

- Repo: `github.com/genXplatinum/puranidhun`
- Live: <https://puranidhun.in>
- Deploys on every push to `main` via `.github/workflows/deploy.yml` — no
  build, the repo root *is* the site.

Pages must be switched on once by hand: **Settings → Pages → Build and
deployment → Source: GitHub Actions**. The workflow's `GITHUB_TOKEN` cannot
do it, because enabling Pages needs admin rights the token is never given.

DNS lives at BigRock (nameservers `dns1–4.bigrock.in`). The apex needs four
A records to GitHub's Pages IPs and `www` a CNAME to `genxplatinum.github.io`
— see the DNS block at the bottom of this file.

## Running it

No build step, no dependencies, no images. Plain HTML, CSS and JavaScript.

```bash
node .dev-server.js
```

Then open <http://localhost:5173>. Any static host will do — Netlify,
Vercel, Cloudflare Pages, GitHub Pages, an S3 bucket. `.dev-server.js` is
only for local preview and can be deleted before deploying.

## What is where

```
index.html                    the player, and nothing else
assets/css/purani-dhun.css    one stylesheet, sectioned and commented
assets/js/catalog.js          369 tracks, factual metadata only
assets/js/rooms.js            nine rooms: three pigments and a sentence each
assets/js/rangoli.js          the generative engine
assets/js/app.js              queue, YouTube, index, keyboard
assets/img/favicon.svg        the only image the page itself loads
assets/img/og.png             link previews only; never fetched by the page

gym.html                      Loha — the gym page, its own thing entirely
assets/css/loha.css           dark, and shares no tokens with the board
assets/js/gym-catalog.js      324 Punjabi tracks, one flat list
assets/js/corridor.js         one WebGL shader: the tunnel
assets/js/loha.js             queue, YouTube, tempo clock, shake
```

The whole site is about 260 KB before fonts. There is not a single
photograph in it, and the only bitmap anywhere is the link-preview card.

Two pages, deliberately unalike. `index.html` is the pale board and the
nine rooms of old records; `gym.html` is a dark corridor of Punjabi gym
music that opens only when you click **Gym Playlist** at the end of the
room rail. They share the repo, the Khand typeface and the no-build rule,
and nothing else — see [The gym page](#the-gym-page--ਲੋਹਾ--loha) at the
bottom of this file.

## Type

Two families, and both of them set Devanagari and Latin from one hand, so
the two scripts are siblings rather than neighbours:

| Token | Face | Does |
| --- | --- | --- |
| `--voice` | Tiro Devanagari Hindi | the wordmark, the song, the search field |
| `--sign` | Khand | every control, legend, numeral and label |

Tiro is the voice: a calligraphic Devanagari with real pen contrast, drawn
by a foundry that treats the script as a script rather than as a glyph
range bolted onto a Latin. It ships in **one weight, 400** — that is not a
limitation to work around but the reason it looks drawn instead of set at
the sizes the wordmark uses. Khand is the machine: an Indian Type Foundry
condensed face that is already the lettering of shop boards and bus
destination plates, which is exactly the register a deck legend wants.

**Devanagari leads.** On a cassette inlay the Hindi title *was* the title
and the Latin underneath it was the transliteration, so that is the order
here — देवनागरी first and large, Latin beneath it in signage caps. The
previous build had this backwards, declaring Devanagari a first-class
script and then styling it everywhere as an accessory: smaller than the
Latin, in secondary ink, at reduced opacity.

116 of the 369 records carry no Devanagari title in the catalogue. Those
lead with their Latin title in the voice face and drop the second line,
rather than showing an empty heading — see `now__title:empty` in the
stylesheet and the `t.d || t.t` fallbacks in `app.js`.

There is no monospace token and no `.eyebrow`. A mono face used for every
small label, tracked out past `.2em` in uppercase, is the single most
recognisable tell in generated CSS, and the old stylesheet had ten
near-miss variants of it at ten hand-picked sizes and trackings.

## The door

A browser will not start audio without a gesture, so the first screen has
to exist anyway. It may as well say what the place is.

The rangoli behind it is drawn in **ink, not powder** — knocked back to
0.38 opacity, raw haldi at 1.45:1 is simply not there. And the mask over
it is a halo rather than a backdrop: it clears the middle so the wordmark
and the line sit on open ground, keeps the band of rings around them, then
fades before the edges. The figure rings the text the way a rangoli rings a
doorway, instead of being a watermark printed underneath it.

The line under the wordmark is set in the voice face, italic, because it is
the archive talking rather than the interface. The last clause of the fine
print is hidden below 560px — on a phone it wraps mid-phrase otherwise.

## The controls

Everything you can touch is one of two things.

A **key** is pressed. It stands proud of the board on a lip and travels
*downward* into it when you press it, the way a cassette deck key does.
Nothing on this page lifts toward the cursor — the `translateY(-1px)`
hover lift is the web's reflex, not a material one.

A **label** only names a thing. It is a spine on a shelf of cassettes: set
in signage caps and underscored, never boxed and never filled. The nine
rooms are labels, the filters are labels.

There are no pills anywhere. `border-radius:999px` on a hairline-bordered
button is a default, not a decision, and the old build used it for the
buttons, the room rail and the filter chips alike.

## The rangoli

A rangoli is drawn at a doorway in loose powder, on a grid of dots, in
radial symmetry, and swept away the same evening.

Each record draws its own. The **video id seeds the geometry**:

- how many times the motif repeats around the circle — 6, 8, 10, 12 or 16
- how many rings — four or five
- which motif sits on each ring — petal, drop, scallop, diamond, ray,
  chevron, dots or a plain band
- stroke weights, phase offsets, and which way each ring turns

The **room supplies the pigments** — turmeric, vermilion, saffron, gulal,
jamun, indigo, peacock, neem, dhoop — one triad per room, and no two rooms
lead with the same colour.

So the same song looks the same every time you play it, looks different
from every other song, and changes colour when you carry it into another
room. Rings counter-rotate on staggered clocks (26s, 35s, 44s, 53s, 62s)
and hold still the moment you pause, like a lifted needle.

Sampled over 120 records, 115 produced a distinct fold/ring/motif
signature before phase and colour are even counted.

## Rooms

Nine, each with its own pigment triad and its own running order. Many songs
belong to six or seven rooms at once, so ordering by anything global would
open every room with the same record. Each room instead sorts its own list
by a hash of `(room id + video id)` — stable across reloads, different in
every room.

### Powder and ink

Every pigment exists twice, and the difference is not decorative.

`--pig-a` is the **powder**: the raw, saturated colour, used for the
rangoli's own figure, where the shapes are large and vibrancy is the whole
point. `--pig-a-ink` is the same pigment darkened until it clears 4.5:1
against the board — used for anything you have to *read*: the progress
ring, the numerals, the focus outline, a live label, an engaged key.

Without that split three of the nine pigments are effectively invisible on
a light ground. Raw haldi is **1.45:1**, kesari 2.28 and dhoop 2.39, and
two rooms lead with one of them: Auto Galli opened in turmeric with a
progress ring you could not see. In ink, haldi is 4.59:1.

The ink values in `rooms.js` are the worst case across all ten grounds the
page can paint — the bare board plus the nine room washes — because the
wash darkens the board slightly and takes a little contrast with it. If you
change `BASE` in `app.js` or add a pigment, re-derive them; do not eyeball
it.

## Keyboard

| Key | Does |
| --- | --- |
| `Space` | play / pause |
| `←` `→` | previous / next track |
| `↑` `↓` | volume |
| `S` | shuffle |
| `/` | open the index and search |
| `1`–`9` | jump to a room |
| `Esc` | close the index |

## Notes

- **Playback** goes through the YouTube IFrame Player API. The player is
  rendered at 1×1 px in a corner — it has to be rendered, because browsers
  throttle a `display:none` iframe. If a video is gone or blocked from
  embedding, `onError` drops it from the queue and moves on, so a dead id
  never stalls a room. YouTube's terms expect the player to be visible; if
  that matters for your use, make `#yt-host` a visible element.
- **Track metadata** — titles, singers, films, years and video ids — was
  gathered from the public listings of saloon.wtf, deluxesaloon.space and
  walavibes.wtf, who mapped this corner of the catalogue first. Only the
  facts were taken; their writing, artwork and code are their own and none
  of it appears here. That credit was removed from the page at the client's
  request and lives here instead.

  The gym page's 298 Punjabi tracks came later and from a different place —
  see **The gym page** below.
- **The songs** belong to their composers, singers, lyricists and labels.
  Playback is handed to YouTube, which counts the play and pays the rights
  holder.
- **Three CSS traps worth knowing** if you edit this.
  1. `#index{display:flex}` outranks the browser's `[hidden]{display:none}`,
     because an id selector beats an attribute selector. That left the
     closed track panel sitting invisibly over the whole player at
     `z-index:60`, swallowing every click. It now carries an explicit
     `#index[hidden]{display:none}` and `pointer-events:none` when closed.
     If you add another overlay, do the same.
  2. A transition on a property whose value comes from a custom property
     does not re-fire when only that custom property changes, so the room
     wash is set directly on `document.body` from JS.
  3. A single-column grid defaults to an `auto` column, which stretches to
     its widest child — the nine-pill room rail — and pushes the page
     sideways. `grid-template-columns:minmax(0,1fr)` pins it.
- The design is committed to light. The board is `#e4e2dc` — a swept
  cement grey, not a warm cream. There is no dark mode; adding one means
  re-tuning all nine pigments *and* all nine inks against a dark ground.
  `html{color-scheme:light}` says so out loud, which stops a phone in dark
  mode force-darkening the range inputs, the search field and the
  scrollbar against a board that stays pale regardless.
- **The phone's own furniture takes the room colour too.** `paintRoom()`
  writes the current wash into `<meta name="theme-color">` as well as onto
  the body, so Chrome's address bar on Android and Safari's status and tab
  bars on iOS carry it — the room runs to the top and bottom edges of the
  screen instead of stopping at the page. The nine washes are close but
  distinct: Saloon is `#daded8`, Auto Galli `#e5e0d3`, Mistri Kaam
  `#e4dbd5`.

  This is why `wash()` returns hex rather than `rgb(r g b)`. The
  space-separated form is fine in CSS but is not parsed inside a
  `theme-color` meta by every browser that supports `theme-color` at all,
  and it fails silently — the bar just stays default. If you change
  `wash()`, keep it emitting hex.
- `assets/img/og.png` (1200×630) is generated by the site's own rangoli
  engine, drawn to a canvas and exported. It does **not** update itself: if
  the board colour, the pigments or the wordmark change, it will keep
  showing the old ones, and so will every link preview. Regenerate it, and
  fix `og:image:alt` to match — the alt text names the actual colours.
  Note that canvas resolves a webfont only when that exact weight has
  already been loaded, so `document.fonts.load()` every weight the image
  draws with or it will silently fall back to a system serif.

  **Bump the version when you regenerate it.** The meta points at
  `og.png?v=2`, not `og.png`. Facebook, WhatsApp, Slack and Twitter cache
  a preview image against its URL and hold it for a long time — often
  until someone manually re-scrapes the page. Same filename, same old
  card, however many times you redeploy. Changing the query string makes
  it a new URL to every scraper, which is the only reliable way to push a
  new card out. To force the existing one immediately, run the page
  through Facebook's Sharing Debugger and Twitter's Card Validator.

## DNS

At BigRock, for the apex `puranidhun.in`:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | genxplatinum.github.io |

The `CNAME` file in the repo root already claims `puranidhun.in`, so Pages
binds the domain as soon as the records resolve. Tick **Enforce HTTPS** in
Settings → Pages once the certificate is issued (usually under an hour
after DNS propagates).

---

# The gym page — ਲੋਹਾ / Loha

`gym.html` is the other half of this repo and shares almost nothing with
the first. Purani Dhun is a pale board, nine rooms of old Hindi records,
and a rangoli that turns while the tape runs. Loha is a dark corridor,
Punjabi only, and it hits you on the beat. It has its own stylesheet, its
own catalogue and its own machine; the main site links to it from the end
of the room rail and that is the whole of the connection.

It is a separate page on purpose. The gym songs are twenty and thirty
years younger than everything in the main catalogue, they are in a
different language, and they wanted a room the pale board could not give
them without ruining itself.

## Three decks

One page, three playlists, switched by the row of plates under the wordmark.
The catalogue is **one flat list of 324 records**; the decks are cuts of it,
derived at load, so nothing is stored twice and nothing can fall between
two of them.

| Deck | Cut | Tracks |
| --- | --- | --- |
| `Now` | `y >= 2019` | 113 |
| `The Era` | `2005 <= y <= 2018` | 183 |
| `Badmashi` | `b === 1` and (`y <= 2016` or undated) | 135 |

`Now` and `The Era` split on year and never overlap. **`Badmashi` is a
different axis** — a genre mark carried on the record itself — so it
crosses both and reaches back past where either one starts. A song can be
in `The Era` and `Badmashi` at once, and about a hundred are.

`The Era` is what was on repeat in gyms between 2005 and 2018. It is
heaviest in 2011–2014 — the Honey Singh, Imran Khan, Bohemia and Panjabi MC
years that actually played on gym speakers — and again in 2016–2018 with
Mankirt Aulakh, early Sidhu Moose Wala, Ninja and Amrit Maan.

`Badmashi` is the gangster and outlaw cut, from before 2000 up to 2016. It
starts in the **kali** tradition — the outlaw ballads that are the original
badmashi genre, Kuldeep Manak's *Jeona Morh* and *Sucha Soorma*, Chamkila's
*Jatt Di Dushmani* — runs through Bindrakhia and the akhara sound of the
90s, then Bohemia and Imran Khan in the 2000s, and lands on the 2011–2016
jatt-and-weapon wave. Twenty of these carry **no year at all**: most of the
kali repertoire circulated on cassette long before anyone catalogued it,
and a blank is more honest than a guess.

Nobody keeps a record of what a gym played, and no filter decides what
counts as badmashi. Both of those decks are hand-picked judgements. Treat
them as an argument rather than an archive, and send corrections.

## Where the tracks came from

Search and mix listings on YouTube, then hand-curation, then verification:

- ~1,500 candidates harvested from artist and topic searches plus the
  auto-generated mixes seeded off known tracks;
- filtered to single songs on official label or artist channels — no
  jukeboxes, mashups, bass-boosted re-uploads, slowed-and-reverb edits or
  compilations;
- picked by hand against a want-list, because "aggressive" is a judgement
  no filter is going to make for you;
- **every id fetched and confirmed to still resolve** before it went in;
- then **audited against each video's real title and channel**, which
  caught seven entries a fuzzy search had got wrong — a truck-driver vlog
  standing in for Sharry Mann's *Transporter*, a VDJ re-upload of *Mundian
  To Bach Ke*, and a "Sarpanch by Varinder Brar" that was really *Sarpanchi*
  by Raj Brar.

Two things worth knowing about the metadata. First, the same record often
exists twice — the label's upload and the artist's own re-upload years
later — so entries are collapsed by title and then confirmed with a fuzzy
compare of the whole artist credit, keeping the earliest. ("Alfaaz Honey
Singh" and "Alfaaz · Yo Yo Honey Singh" are one credit written two ways;
*Sardari* by Kamal Grewal and *Sardari* by Sippy Gill are two different
songs.) Without that a 2013 record turns up in the `Now` deck wearing a
2025 date. Second, for the pre-2013 records the YouTube upload date is
*not* the release date, so those years are release years, carried by hand.

## The corridor

`assets/js/corridor.js` is one WebGL fragment shader over a full-screen
triangle. No geometry, no library, no build step, in keeping with the rest
of the repo.

It is **not a raymarch**. For a box tunnel the wall a ray hits can be
solved outright —

```
t = min(halfWidth / |d.x|, halfHeight / |d.y|)
```

— so each pixel costs a division and a compare rather than forty steps of
distance-field marching, which is why it holds 60fps on a phone. Everything
after that is texturing the wall by `(z, across)`: corrugation, panel seams,
ribs every four units, hazard chevrons low on both sides, strip lights along
the roof, and their spill down the walls and bounce off the floor.

Two details do most of the work:

- **Near lamps are faded out** (`smoothstep(0.6, 4.5, p.z)`). Without it the
  lamp directly overhead has a tiny `t`, blows the top of the screen into a
  white sheet, and the tunnel stops reading as a tunnel at all.
- **The leading edge of each rib is lit.** That one bright line is what
  sells the forward motion; corrugation alone reads as static texture.

If the context will not come up, the canvas is hidden and the CSS behind it
— a lit concrete floor — stands in. The page works without WebGL.

## On the beat, and the honest version of it

**Nothing on this page is listening to the music.** The player is a
cross-origin YouTube iframe: `createMediaElementSource()` needs same-origin
media and there is no API for the spectrum, so a real analyser is not
possible here, and anything claiming to be one would be lying to you.

What it keeps instead is a **tempo clock**. Playback position is known to
the frame, so given a tempo the beat is arithmetic:

```
phase = ((elapsed - phase0) * bpm / 60) % 1
beat  = (1 - phase)^3        bar = every fourth beat, (1 - phase)^4
```

The default is 96 BPM, roughly where this music sits. The **Tap** key fixes
it properly: tap four times and it sets the tempo *and* the phase from your
taps, per track, remembered in `localStorage`. The readout turns from yellow
to ice once a track's tempo has actually been set rather than assumed.

`beat` and `bar` then drive everything — the corridor squeezing, the lens
widening, the lamps flaring on the downbeat, the shake, the chromatic split
on the title, and `navigator.vibrate()` when Haptics is on.

## One corridor, three rooms

Switching decks repaints the whole page, not just the list. The shader
takes an accent colour, a lamp colour and a `mood` scalar, and the CSS
swaps its accent token on `<html data-deck>`, so every chip, slider,
underline and lit key follows the room:

| Deck | Lamps | Paint | Room |
| --- | --- | --- | --- |
| `Now` | cold white | hazard yellow | a working shed |
| `The Era` | tungsten | amber | how a room lit in 2011 actually looked |
| `Badmashi` | red | red | the same corridor with the white lights cut |

`mood` also warms the steel toward rust, deepens the haze, tightens the
vignette and hardens the downbeat wash. The rib highlights take it too —
without that, the nearest frame reads as a cold blue box hanging in the
middle of a red corridor, which is exactly what the first version did.

All three accents clear 4.5:1 on the void and carry black text when a key
is pressed; the red is the tightest at 5.6:1.

## What shakes, and what does not

The room shakes. The type shakes, in the opposite direction and at 42% of
the throw, which is what makes it read as the *room* moving rather than the
page wobbling. **The controls do not move at all.**

That last part was a bug first. The original build threw the whole shell
around, and the giveaway was that a browser automating the page could not
click the deck switch — "element is not stable", 96 times a minute. A key
you have to chase is a broken key, and that goes double for anyone whose
hands are not steady to begin with. So `#room` and `#type` take the hit and
`#shell`, which holds everything you can touch, is bolted down.

`Force` sets how hard all of it lands, from nothing to full, and is
remembered between visits.

## Reduced motion

`prefers-reduced-motion: reduce` is not a suggestion on a page built out of
strobing and shake — that is exactly the page a vestibular disorder cannot
take. On reduce, Force is capped at 0.28, nothing is displaced at all, the
chromatic split is off and the grain stops drifting. The corridor still
lights on the beat, so the page still answers the music; it just stops
throwing the room at you.

## Keyboard

| Key | Does |
| --- | --- |
| `Space` | play / pause |
| `←` `→` | previous / next track |
| `↑` `↓` | volume |
| `S` | shuffle |
| `T` | tap the tempo |
| `1` `2` `3` | Now / The Era / Badmashi |
| `/` | open the rack and search |
| `Esc` | close the rack |

## Type

Khand carries over from the main site — it is already the lettering of
Indian shop boards, and set at 700 in caps at 8rem it is the right register
for a page you read from the floor with a bar on your back. The voice face
is **Tiro Gurmukhi** rather than Tiro Devanagari: these are Punjabi records
and Gurmukhi is their script.

Song titles are set in Latin, which is the opposite of the main site's
rule. That is deliberate. This music is *marketed* in Latin — Speed Records
and Geet MP3 print "Bambiha Bole" on the artwork, not ਬੰਬੀਹਾ ਬੋਲੇ — and
transliterating several hundred titles by hand would have put a great deal
of guesswork on the page. The wordmark says ਲੋਹਾ and means it; the track
list follows the records.
