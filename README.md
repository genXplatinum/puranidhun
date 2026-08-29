# Purani Dhun — पुरानी धुन

394 Hindi and Punjabi records in ten rooms. Nine of the rooms are the old
records the site is named for; the tenth is a gym playlist and is not old at
all. Every song draws its own rangoli, and the rangoli is the record: its rings turn while the tape runs
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
assets/js/catalog.js          394 tracks, factual metadata only
assets/js/rooms.js            ten rooms: three pigments and a sentence each
assets/js/rangoli.js          the generative engine
assets/js/app.js              queue, YouTube, index, keyboard
assets/img/favicon.svg        the only image the page itself loads
assets/img/og.png             link previews only; never fetched by the page
```

The whole site is about 200 KB before fonts. There is not a single
photograph in it, and the only bitmap anywhere is the link-preview card.

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

116 of the 394 records carry no Devanagari title in the catalogue. Those
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
in signage caps and underscored, never boxed and never filled. The ten
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
jamun, indigo, peacock, neem, dhoop, surma — one triad per room, and no two
rooms lead with the same colour.

So the same song looks the same every time you play it, looks different
from every other song, and changes colour when you carry it into another
room. Rings counter-rotate on staggered clocks (26s, 35s, 44s, 53s, 62s)
and hold still the moment you pause, like a lifted needle.

Sampled over 120 records, 115 produced a distinct fold/ring/motif
signature before phase and colour are even counted.

## Rooms

Ten, each with its own pigment triad and its own running order. Many songs
belong to six or seven rooms at once, so ordering by anything global would
open every room with the same record. Each room instead sorts its own list
by a hash of `(room id + video id)` — stable across reloads, different in
every room.

### Gym Playlist, the tenth room

The other nine rooms are places, and the record is old in all of them. This
one is a use, and the records are new: 25 Punjabi tracks from 2014–2022,
Ninja and Sidhu Moose Wala and Karan Aujla, running 95 minutes.

It came from a YouTube mix — `list=RDMkvy03tK4C8`, seeded off Ninja's
*License*. A mix is generated per viewer and cannot be linked to at all: ask
YouTube for that playlist and it answers *"this playlist type is
unviewable."* So the mix was read once, flattened, and the video ids pinned
into `catalog.js`. What is in the room now is what the mix served that day;
it will not drift the way the live mix does.

These 25 sit in **one room only**, unlike the rest of the catalogue, where a
song commonly belongs to six or seven. They are twenty and thirty years
younger than everything else here and would read as a mistake if they turned
up in Saloon Classics.

They also carry a mood of their own, `josh` — जोश, drive. The filter chips
are built from whatever moods the catalogue actually contains, so it
appeared in the index by itself.

### Powder and ink

Every pigment exists twice, and the difference is not decorative.

`--pig-a` is the **powder**: the raw, saturated colour, used for the
rangoli's own figure, where the shapes are large and vibrancy is the whole
point. `--pig-a-ink` is the same pigment darkened until it clears 4.5:1
against the board — used for anything you have to *read*: the progress
ring, the numerals, the focus outline, a live label, an engaged key.

Without that split three of the ten pigments are effectively invisible on
a light ground. Raw haldi is **1.45:1**, kesari 2.28 and dhoop 2.39, and
two rooms lead with one of them: Auto Galli opened in turmeric with a
progress ring you could not see. In ink, haldi is 4.59:1.

The ink values in `rooms.js` are the worst case across all eleven grounds
the page can paint — the bare board plus the ten room washes — because the
wash darkens the board slightly and takes a little contrast with it. If you
change `BASE` in `app.js` or add a pigment, re-derive them; do not eyeball
it.

Surma, the tenth pigment, is the only one darker than the board, so its
wash pulls the ground *down* rather than sideways. It was chosen light
enough (`#dddcd7` once washed) to stay above the darkest ground already in
play — jamun's `#dfdada` — which is why adding a tenth room changed none of
the nine ratios that came before it. A darker surma would have forced a
re-tune of all nine.

## Keyboard

| Key | Does |
| --- | --- |
| `Space` | play / pause |
| `←` `→` | previous / next track |
| `↑` `↓` | volume |
| `S` | shuffle |
| `/` | open the index and search |
| `1`–`9` | jump to a room |
| `0` | jump to the tenth room, Gym Playlist |
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

  The Gym Playlist 25 came later and from a different place: the ids and
  durations off the YouTube mix itself, and the song title, singer, film and
  year off each video's own description block, which for these labels lists
  them as credits. Every one of the 25 was checked to still resolve before
  it went in.
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
  re-tuning all ten pigments *and* all ten inks against a dark ground.
  `html{color-scheme:light}` says so out loud, which stops a phone in dark
  mode force-darkening the range inputs, the search field and the
  scrollbar against a board that stays pale regardless.
- **The phone's own furniture takes the room colour too.** `paintRoom()`
  writes the current wash into `<meta name="theme-color">` as well as onto
  the body, so Chrome's address bar on Android and Safari's status and tab
  bars on iOS carry it — the room runs to the top and bottom edges of the
  screen instead of stopping at the page. The ten washes are close but
  distinct: Saloon is `#daded8`, Auto Galli `#e5e0d3`, Mistri Kaam
  `#e4dbd5`, Gym Playlist `#dddcd7`.

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
