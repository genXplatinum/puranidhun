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
assets/img/favicon.svg        the only image in the project
```

The whole site is about 200 KB before fonts. There is not a single
photograph or bitmap in it.

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
- The design is committed to light. There is no dark mode; adding one means
  re-tuning all nine pigments against a dark ground.
- `assets/img/og.png` (1200×630) was generated by the site's own rangoli
  engine, drawn to a canvas and exported. If the palette or wordmark
  changes, it will not update itself — regenerate it.

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
