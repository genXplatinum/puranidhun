# The link-preview cards

`assets/img/og.png`, `og-gym.png` and `og-max.png` are generated, not drawn.
Each one is a real render of the page it belongs to: the same `corridor.js`
shader, the same fonts, the same tokens, held on a single frame.

Regenerate them when a room's identity, its record count, or its line
changes — the counts are printed on the cards and go stale.

## How

```sh
# 1. a self-contained font sheet — the renderer must not need the network
curl -sS "https://fonts.googleapis.com/css2?family=Khand:wght@500;600;700\
&family=Tiro+Devanagari+Hindi&family=Tiro+Gurmukhi&display=swap" -o fonts.css
python3 inline_fonts.py          # rewrites every woff2 url as a data: URI

# 2. render, at 1200x630, one still frame each
cp ../../assets/js/corridor.js .
python3 -m http.server 5199 &
node shoot.js                    # -> /tmp/og/{main,gym,max}.png

# 3. quantise, then install
python3 quantise.py              # 256 colours; ~30% smaller, error < 0.25/255
```

## Why it is built this way

**The fonts are inlined.** Chromium in this environment reaches nothing over
HTTPS, and a card that silently falls back to a system sans is a card that
ships wrong and nobody notices until it is in somebody's chat window.

**The corridor is really rendered.** It would have been quicker to fake the
tunnel with CSS gradients, but then the card stops matching the page the
moment the shader changes.

**A pad sits behind the type.** The corridor is brightest at its vanishing
point, which is exactly where the wordmark goes. The pages never have this
problem because their type moves and the eye tracks it; a still card needs
the ground held down.

**256-colour PNG.** These are near-monochrome gradients over black, so an
adaptive palette is visually lossless here — mean error 0.05–0.22 out of
255 — and takes each card from ~255KB to ~180KB. WhatsApp gets unreliable
about link-preview thumbnails much past 300KB.

## After regenerating

Bump the `?v=` on `og:image` and `twitter:image` in all three pages.
Facebook, X and WhatsApp cache aggressively by URL and will keep serving
the old card indefinitely otherwise.
