# Working in this repo

Baked Potatoes: a site for what to watch when you're baked. `public/` is the site
(static, no build step). It deploys as a Cloudflare Worker serving `public/` as static
assets (`wrangler.jsonc`); every push to `main` redeploys. Real movie data will be
added to the same Worker (see README).

## Brand decisions (settled with the owner, keep them)

- **Name and score:** Baked Potatoes. The rating is the **Potato Score**, out of 10 with one
  decimal (8.8/10), shown with the potato icon (`public/img/potato.png`) beside the number
  (owner's call, 2026-10-26). Fully Loaded 7.5–10, Half Baked 5.0–7.4, Cold Potato 0–4.9.
  Scores are stored 0–100 in the data and divided by 10 for display. "Half Baked" is a Ben &
  Jerry's trademark; check before launch.
- **Watchlist vocabulary:** swipe right = **stash it**, left = **pass**; the watchlist
  is **your stash**.
- **Logo:** the traced fingerling potato (from a public-domain USDA photo), 30% chunkier,
  mostly upright leaning right, flipped and mirrored, next to "baked potatoes" in
  **Arimo Bold, lowercase, stacked**. Files in `brand/logo/`. No faces on the potato.
- **Look:** superseded on 2026-10-26 by the poster wall below.
- **No pot leaves, rasta colours or 420 jokes.** The brand is about the feeling, and
  leaf-free branding is easier to advertise.

## Feel of the site (owner's call, 2026-10-26)

A wall of movie posters on a grainy black starfield (dense speckled stars, a few bright
glints, paper-grain noise), with a layer of stars that slowly twinkle. Every poster image
carries a very light, even paper texture, not specks (a generated tile, `GRAIN`, no blend
modes; also painted into
the peel snapshot). Drag a poster to peel it: it rolls up from the top corner opposite the swipe (top-left
when you swipe right, top-right when you swipe left) like paper coming off a wall, and
follows your finger the whole way (`peel()`: strips across a tilted axis; strips above the
roll line wrap into a tube). Whatever side is showing is painted once into a canvas
(`frontSnapshot()`, prepared at idle; `backSnapshot()` draws the details side from the
live layout, with the trailer's YouTube still, never the live player) and each strip is a
canvas slice. The roll is one light cream curl: paper past half a turn is hidden, never
drawn as layers (owner: "light, simple and cream"). A glass back button top left
(`undo()`) brings back the last poster passed or stashed. Strips are flat siblings placed by code, and code decides which side of each
strip shows: no nested 3D, no backface-visibility (iOS Safari gets both wrong). The twinkle pauses while a poster is peeled. Let go far enough right to stash, left to
pass, and it rolls the rest of the way off; let go early and it lays back flat. The next
poster is live underneath while the roll plays. Tap
to flip it. Fronts are real TMDB posters once `TMDB_TOKEN` is set; until then, original
placeholder posters in three print styles (torn-paper photo, 80s one-sheet, halftone
screen print). Inspired by real posters, never copies of them. Exception: the three
posters in `public/posters/` (Ferris Bueller's Day Off, The Truman Show, Fight Club) are
the owner's own reference images, used as stand-ins until TMDB is on; delete them then.

There is no header bar (owner: it took too much space). Each poster card carries its own
flash-card label under the picture, inside the black frame: title (two lines at most),
year · runtime · genre, and the potato score. The card is 1:1.66 so the poster keeps its
2:3 shape above the label. The back has no buttons; the plot and credits use the room.

Every poster sits in a cream mount with a black frame line, with one even gap (`--gap`,
2.8% of the card width) from the card edge to the line and from the line to the poster;
the back uses the same frame. How to use it is said quietly:
one line of small text under the poster ("← pass · tap for the plot · stash →", each a
button), and on a first visit the top poster peels a little to the right, then to the
left, to show the gesture, until someone peels or flips. Owner wants these low key, not flash cards. The
filters are called **categories** (not vibes) on the page. The stash list shows a mini
poster beside each title. A small one/grid toggle (frosted glass, top-right corner level with the wordmark, not in
the nav and not taking its own row) switches to a
scrolling grid of every poster left (tap one to open it on top of the stack); the choice
is remembered.

The back of each poster, the header, the nav and the drawers are **vintage flash cards**:
cream paper, a heavy black rounded frame and a lowercase grotesque label (Inter Tight). No
drawings (owner removed them, 2026-10-26). The top of each poster back is the **trailer
slot**: once TMDB is connected, flipping a poster loads its YouTube trailer there
(`/api/trailer`, youtube-nocookie embed, removed again on flip back), with a "full screen"
button that opens it on YouTube (iPhone can't full-screen an embed inside the 3D card).
The wordmark sits at the top centre of every page: "baked potatoes", Arimo Bold,
lowercase, stacked, cream (owner's call, 2026-10-26; the name is back on).
Rejected so far: space gradients, texture everywhere, typewriter/handwriting fonts,
stickers/VHS, the 70s eyeball broadcast, the A24 disc library.

## Copy

Plain, deadpan, kind. Specific beats clever. Errors say what happened and what to do.

## Practical rules

- Test at 375px wide and on desktop; the body must never scroll sideways.
- Wrap every `localStorage` access in try/catch.
- Don't hardcode streaming availability; it comes from live data.
- Respect `prefers-reduced-motion` (the peel and flip animations already do).
