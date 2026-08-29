# Purani Dhun — पुरानी धुन

369 old Hindi and Punjabi records in nine rooms, on a dark ground. Every
song draws its own rangoli, lit in the room's own colours, and the circle
around the outside is how far through the song you are.

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
assets/css/loha.css           THE SYSTEM. Both pages load it first.
assets/js/corridor.js         one WebGL shader: the tunnel, both pages

index.html                    the player — nine rooms of old records
assets/css/dhun.css           this page's half: the rangoli, the rail
assets/js/catalog.js          369 tracks, factual metadata only
assets/js/rooms.js            nine rooms: three pigments and a sentence each
assets/js/rangoli.js          the generative engine
assets/js/app.js              queue, YouTube, tempo clock, rooms, index

gym.html                      Loha — the gym playlist, four decks
assets/css/loha.css           (see above; the gym page adds nothing)
assets/js/gym-catalog.js      499 Punjabi tracks, one flat list
assets/js/loha.js             queue, YouTube, tempo clock, decks

assets/img/favicon.svg        the only image either page loads
assets/img/og.png             link previews only; never fetched by a page
```

No build step, no dependencies, no photographs. The only bitmap anywhere
is the link-preview card.

**Two pages, one design.** They used to be opposites — a pale cement board
here, a dark corridor there — and that was a decision, until it wasn't.
The site now runs the corridor on both. `loha.css` holds everything they
share: the tokens, the corridor layers, the plate keys, the chips, the
door, the rack. `dhun.css` holds only what this page has and the gym page
does not.

What each page keeps is what makes it itself:

| | `index.html` | `gym.html` |
| --- | --- | --- |
| centre of the screen | a rangoli, one per song | the corridor, uninterrupted |
| the cut | nine **rooms** | four **decks** |
| the voice face | Tiro Devanagari Hindi | Tiro Gurmukhi |
| titles set in | Devanagari, Latin beneath | Latin |
| accent colour | the room's lead pigment | the deck's |
| default tempo | 84 BPM | 96 BPM |

The two title rules are opposite on purpose. A Hindi cassette inlay printed
the Devanagari as the title and the Latin under it as the transliteration,
so that is the order here. Modern Punjabi releases are marketed in Latin —
Speed Records prints "Bambiha Bole" on the artwork, not ਬੰਬੀਹਾ ਬੋਲੇ — so
that is the order there. Same system, opposite call, both deliberate.

## The rangoli

A rangoli is drawn at a doorway in loose powder, on a grid of dots, in
radial symmetry, and swept away the same evening.

Each record draws its own. The **video id seeds the geometry**:

- how many times the motif repeats around the circle — 6, 8, 10, 12 or 16
- how many rings — four or five
- which motif sits on each ring — petal, drop, scallop, diamond, ray,
  chevron, dots or a plain band
- stroke weights, phase offsets, and which way each ring turns

The **room supplies the pigments**, one triad per room, and no two rooms
lead with the same colour. So the same song looks the same every time you
play it, looks different from every other song, and changes colour when
you carry it into another room. Sampled over 120 records, 115 produced a
distinct fold/ring/motif signature before phase and colour are counted.

On black it is **lit rather than printed**. Two drop-shadows: a dark one to
separate it from the corridor, and a coloured one that is the light it is
giving off. Filled motifs are held at `fill-opacity:.78` — opaque, a solid
disc reads as a sticker pasted over the corridor; held just off full it
reads as lit glass with the room still behind it.

The figure breathes on the beat rather than on a loop of its own: `app.js`
writes `--pulse` every frame, so the rangoli, the corridor and the shake
are all on one clock.

## Rooms

Nine, each with its own pigment triad and its own running order. Many songs
belong to six or seven rooms at once, so ordering by anything global would
open every room with the same record. Each room instead sorts its own list
by a hash of `(room id + video id)` — stable across reloads, different in
every room.

The room's lead pigment is written straight into `--haz`, the accent token
the whole system reads. Walk into 90s Dard and the plates, the sliders, the
progress ring, the corridor's lamps and the rangoli all go jamun together.

### Powder, ink, and glow

Every pigment exists **three times**, and none of it is decorative.

| Set | For | Ground |
| --- | --- | --- |
| `PIGMENT` | the rangoli's own figure, saturated | — |
| `PIGMENT_INK` | reading, when the site was pale | `#e4e2dc` |
| `PIGMENT_GLOW` | reading, now that it is dark | `#08090b` |

`PIGMENT_INK` is each pigment darkened until it clears 4.5:1 on the old
board. `PIGMENT_GLOW` is the mirror of it, and it catches the **opposite
end of the same nine**. On the pale board the problem children were the
bright ones — haldi at 1.47:1, kesari 2.37, dhoop 2.49 — and they had to
come down. On black it is the deep ones that vanish: jamun is 2.67:1 raw
and indigo 2.42:1. Those two are lifted (to `#9661ca` and `#5e73d4`),
peacock goes up one step, and **the other six are left exactly as they
are** — lifting a colour that does not need it only washes the room out.
Hue and saturation are held; only lightness moves.

`PIGMENT_INK` is kept even though nothing paints on `#e4e2dc` any more. It
is the working for a decision, and deleting it would leave the next person
re-deriving it from scratch to answer "why these nine?".

## Keyboard

Both pages share the transport; only the last row differs.

| Key | Does |
| --- | --- |
| `Space` | play / pause |
| `←` `→` | previous / next track |
| `↑` `↓` | volume |
| `S` | shuffle |
| `T` | tap the tempo |
| `/` | open the rack and search |
| `Esc` | close the rack |
| `1`–`9` | walk into a room *(index.html)* |
| `1`–`4` | Now / The Era / Badmashi / Dance *(gym.html)* |

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
  1. `#list{display:flex}` outranks the browser's `[hidden]{display:none}`,
     because an id selector beats an attribute selector. That left the
     closed track panel sitting invisibly over the whole player, swallowing
     every click. Both pages carry an explicit `#list[hidden]{display:none}`
     and `pointer-events:none` when closed. If you add another overlay, do
     the same.
  2. A `::before` separator between optional fields wants the **general**
     sibling combinator, not the adjacent one. `span + span` leaves a
     leading "· " when the first field is blank; `span:not(:empty) + span`
     fixes that and then swallows the separator when the *middle* field is
     blank. `span:not(:empty) ~ span:not(:empty)` asks the actual question:
     did any field come before this one. See `.tags` in `dhun.css`.
  3. A full-screen shader is fill-rate bound, so `corridor.js` caps the
     pixel ratio at 1.75 rather than taking the device's own. Above that
     there is nothing left to see and a phone just gets hot.
- **The whole thing is dark now, and says so.** `html{color-scheme:dark}`
  stops a browser force-*lightening* the range inputs, the search field and
  the scrollbar. `<meta name="theme-color">` is pinned to the void rather
  than following the room: the accent changes on every room change, and a
  phone's address bar strobing through nine colours as you walk the rail is
  worse than one that simply matches the page.
- `assets/img/og.png` (1200×630) is generated by the site's own rangoli
  engine, drawn to a canvas and exported. **It is currently out of date**:
  it still shows the pale board this site no longer has. Regenerating it
  against the dark ground is the one loose end of the redesign. It does not
  update itself, and neither does any link preview already cached. Regenerate it, and
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

## Four decks

One page, four playlists, switched by the row of plates under the wordmark.
The catalogue is **one flat list of 499 records**; the decks are cuts of it,
derived at load, so nothing is stored twice.

Each record says what it *is* — three marks, and the decks cut on those
rather than on vibes:

| Mark | Means |
| --- | --- |
| `g` | it belongs under a bar |
| `b` | badmashi: gangster, outlaw, rivalry, jail, swagger |
| `d` | it empties a room onto the floor |

| Deck | Cut | Tracks |
| --- | --- | --- |
| `Now` | `g` and `y >= 2019` | 112 |
| `The Era` | `g` and `2005 <= y <= 2018` | 273 |
| `Badmashi` | `b` and `2000 <= y <= 2016` | 239 |
| `Dance` | `d` and `y >= 2000` | 191 |

The year decks require `g`, and that is the load-bearing part. Without it,
adding a Dance deck would have dragged every wedding banger into `The Era`
on the strength of its release date alone — *Hath Chumme* fills a floor and
belongs nowhere near a set of deadlifts. A record can carry all three marks,
and several do.

`The Era` is what was on repeat in gyms between 2005 and 2018. It is
heaviest in 2011–2014 — the Honey Singh, Imran Khan, Bohemia and Panjabi MC
years that actually played on gym speakers — and again in 2016–2018 with
Mankirt Aulakh, early Sidhu Moose Wala, Ninja and Amrit Maan.

`Badmashi` is the gangster and outlaw cut, **2000 to 2016**. Bohemia and
Imran Khan through the 2000s, the Mafia Mundeer years, and then the long
2011–2016 jatt-and-weapon wave that is the bulk of it — *Gandasa*,
*Badmashi*, *Asla*, *Goli*, *Vaardat*, *Rohb*, *Daang Kharku*, *Gunday
Returns*, *Att De Shikaari*, *Sher Marna*, *Gangland*, *Kabza*.

Nobody keeps a record of what a gym played, and no filter decides what
counts as badmashi. Both of those decks are hand-picked judgements. Treat
them as an argument rather than an archive, and send corrections.

`Dance` is the feel-good cut, 2000 to now: bhangra, the dhol end of the
catalogue, the Honey Singh floor years, the wedding-tent standards and the
modern radio bhangra. *Daru Badnaam*, *Angreji Beat*, *Wakhra Swag*, *Chak
De Phattey*, *Lamberghini*, *Tauba Tauba*, *Naach Meri Rani*, *Brown Munde*.

## What is not in here

One test, two ways to pass it: a record either makes you **lift** or it
makes you **move**. Whether it is a good song is not the question.

Romance, heartbreak and the slow set are out, however big they were —
*Bewafa*, *Cute Munda*, *Thokda Reha*, *Sohne Lagde* and about fifty others
were pulled for exactly that. But a floor-filler is not filler: 36 records
cut earlier as "club" are back carrying `d` alone, because emptying a room
onto the floor is the whole job of the Dance deck.

That cut is a judgement and it is written down as one: `purge` and
`dance_tags` in the build scripts, and the rule at the top of
`gym-catalog.js`. If you add to the file, that is the bar to clear.

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
| `Dance` | a hue wheel | rani pink | somebody patched a lighting desk in |

`Dance` runs a second scalar, `party`. It puts every ceiling bar on its own
colour off a turning wheel, converts the hazard chevrons from paint into a
chase that runs forward with the beat, and adds a mirror ball. That last one
needed a fine sample grid — at 34 cells across a screen the "flecks" come
out as fist-sized magenta squares and read as broken graphics rather than
light; 240 gives glitter.

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
| `1` `2` `3` `4` | Now / The Era / Badmashi / Dance |
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
