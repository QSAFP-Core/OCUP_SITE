# OCUP.ai — static site

Static, dependency-free (beyond Google Fonts) implementation of the OCUP.ai
homepage brief. No build step, no backend, no secrets.

## Local preview

Fetching `data/validation-status.json` requires a local server (the browser
blocks `fetch()` over `file://`). From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. If you just double-click `index.html`
instead, the status grid still renders — `js/validation-render.js` falls back
to an inline copy of the same data — but you should edit the JSON file as the
source of truth, not the fallback.

## Updating validation status

Edit `data/validation-status.json` only. Each zone has a `light` field
(`"none" | "green" | "amber" | "red"`) and an `items` array. The spine dots'
colors are currently hardcoded to match this file — if you change a zone's
light color, update the matching `spine-node__dot--*` class in `index.html`
(search for `data-zone="`) so the spine rail and the status grid stay in
sync. Node *position* on the rail is computed automatically from layout, so
no positional edits are needed there.

## Deploying

- **GitHub Pages:** push as-is, enable Pages on the repo, point a `CNAME` file
  (not included yet) at `ocup.ai` once DNS is ready.
- **Vercel:** `vercel deploy` from this folder with no config needed — it's a
  static site with no framework detection required.

## Hero background video → now a full-page background

`assets/video/hero-bg.mp4` / `.webm` and `hero-poster.jpg` are compressed
from a 15-second Kling clip (source: `Robot_5`, **landscape 1280×720**,
re-shot specifically at 16:9 to fix a cropping problem — see below).
Compressed to 1024px-wide, ~1MB per format, no audio track.

**Why 16:9 matters here:** `object-fit: cover` scales video up until it
fills both container dimensions, then crops the overflow off one axis. The
original clips were portrait (9:16) but the page background fills a
landscape desktop viewport — that mismatch meant the browser had to scale
the video ~2.5–3x to cover the width, cropping away roughly 70% of the
vertical frame in the process. Only a horizontal band (mostly torso) was
ever visible, regardless of where the robot was in its walk cycle. A 16:9
source matches a typical desktop viewport closely enough that cropping is
now minimal — full body and the chest-light color transition should stay
in frame throughout. Ultrawide monitors will still trim a little off the
sides; that's normal and expected with `cover`.

`object-position` on `.page-bg__video` / `.page-bg__poster` is set to
`center 35%` — a slight upward bias so the chest light and face stay
comfortably framed even if a browser window is slightly taller than 16:9.
Adjust that percentage first if a future clip needs different vertical
framing before reaching for anything more complex.

The video now runs as a **fixed, full-page background** (`.page-bg`) behind
the entire scroll, not just the hero viewport — it's `position: fixed`,
sitting at `z-index: 0`, so it stays put while everything scrolls over it.
`<main>` and `.footer` are given explicit `position: relative; z-index: 1`
so they're guaranteed to paint above the video regardless of browser
stacking-order edge cases around `z-index: 0` fixed elements.

Section text no longer sits on solid backgrounds — `.section__inner`,
`.status-card`, and the scope/non-claims block are all translucent glass
panels (`rgba` background + `backdrop-filter: blur()`) so the footage stays
visible in the margins around the text while the text itself stays legible.
If a heading crosses a busier part of the frame and gets hard to read, reach
for a small `text-shadow` or a slightly higher panel opacity on that
specific element rather than darkening the global overlay — a global
darkening trade-off costs the video its presence everywhere to fix
legibility in one spot.

**The spine rail is also page-long now** (`.page-spine`, fixed to the left
edge, `100vh` tall) instead of confined to the hero. Node positions are no
longer hardcoded percentages — `js/main.js` (`layoutNodes()`) measures each
`[data-zone]` section's actual position in the document and places its node
at the matching fraction down the rail, on load and on resize. This means
the rail is a literal, accurate scroll-progress indicator rather than an
approximation — if you add/remove sections or change copy length, the nodes
reflow automatically.

**Playback speed** is one constant: `HERO_VIDEO_SPEED` near the top of
`js/main.js` (currently `0.55`). Adjust that number rather than re-exporting
from Kling if the pace needs tuning — `video.playbackRate` resamples smoothly
in-browser with no quality loss.

**To swap in a different clip:** same ffmpeg pipeline as before, just note
the background now plays continuously behind a much longer page, so keep an
eye on total file size (aim to stay near ~1MB per format if the source clip
runs longer than ~15s):

```
ffmpeg -i your-clip.mp4 -vf "scale=680:-2" -an -c:v libx264 -profile:v high \
  -pix_fmt yuv420p -crf 27 -preset slow -movflags +faststart \
  assets/video/hero-bg.mp4

ffmpeg -i your-clip.mp4 -vf "scale=680:-2" -an -c:v libvpx-vp9 -b:v 0 -crf 35 \
  -row-mt 1 assets/video/hero-bg.webm

ffmpeg -i your-clip.mp4 -vf "select=eq(n\,60),scale=680:-2" -vframes 1 -q:v 3 \
  assets/video/hero-poster.jpg
```

**Known limitation carried over:** still a straight loop, not an authored
seamless one — there's a visible cut at the loop point. Worth asking Kling
for a first/last-frame-matched loop if this becomes a priority.

## Things intentionally not built yet

- No `pilot.ocup.ai` / `evidence.ocup.ai` — footer references them as
  "coming soon" only. Don't link until they resolve.
- No content.json for prose copy — hero/section text is inline in
  `index.html`. If copy starts changing frequently, consider extracting it,
  but for a mostly-static credibility page this was judged not worth the
  extra indirection yet.
