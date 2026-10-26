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
follows your finger the whole way. `peel()` draws it flat on one canvas each frame: the
poster below the fold line (from `frontSnapshot()`, prepared at idle), a light cream tube
along the line and its soft shadow. No 3D at all: every 3D version (strips, backface
tricks) glitched on iOS Safari. The twinkle pauses while a poster is peeled. A glass back
button top right, beside the view toggle (`undo()`), brings back the last poster passed or
stashed. Let go far enough right to stash, left to
pass, and it rolls the rest of the way off; let go early and it lays back flat. The next
poster is live underneath while the roll plays. Tapping a poster no longer flips it
(owner: the back was too small to read): it grows from its own rectangle into a big
flash-card details view (`openDetail()`): trailer, title, score, plot, credits, with an ×
top right; Esc or a tap outside also closes it. Fronts are real TMDB posters once `TMDB_TOKEN` is set; until then, original
placeholder posters in three print styles (torn-paper photo, 80s one-sheet, halftone
screen print). Inspired by real posters, never copies of them. Exception: the three
posters in `public/posters/` (Ferris Bueller's Day Off, The Truman Show, Fight Club) are
the owner's own reference images, used as stand-ins until TMDB is on; delete them then.

There is no header bar (owner: it took too much space). Each poster card carries its own
flash-card label under the picture, inside the black frame: title (two lines at most),
year · runtime · genre, and the potato score. The card is 1:1.66 so the poster keeps its
2:3 shape above the label. 

Every poster sits in a cream mount with a black frame line, with one even gap (`--gap`,
2.8% of the card width) from the card edge to the line and from the line to the poster;
How to use it is said quietly:
one line of small text under the poster ("← pass · tap for more · stash →", each a
button), and on a first visit the top poster peels a little to the right, then to the
left, to show the gesture, until someone peels or flips. Owner wants these low key, not flash cards. The
filters are called **categories** (not vibes) on the page. The default category is
**highest rated** (everything except "save for sober"), and every category is ordered by
score, best first. The current category sits over the poster's top left as a small glass
label with a chevron; tapping it opens the categories list (also in the bottom nav). The stash is a panel that slides
in from the right (full height, flash-card style, dimmed page behind; close with ×, a tap
outside, a swipe right or Esc). Rows: the real mini poster (`miniPoster()`, the image
only, not a shrunk card), title, year · runtime · genre, score, remove. Tapping a row puts
that poster on top of the stack. A small one/grid toggle (frosted glass, top-right corner level with the wordmark, not in
the nav and not taking its own row) switches to a
scrolling grid of every poster left (tap one to open it on top of the stack); the choice
is remembered.

The details view, the nav and the drawers are **vintage flash cards**:
cream paper, a heavy black rounded frame and a lowercase grotesque label (Inter Tight). No
drawings (owner removed them, 2026-10-26). The top of the details view is the trailer
(`/api/trailer`, youtube-nocookie embed, removed again on close).
The wordmark sits top left on every page: "baked potatoes", Arimo Bold, lowercase, on one
line, cream, sized to fill the space up to the buttons on the right (owner's call, 2026-10-26; the name is back on).
Rejected so far: space gradients, texture everywhere, typewriter/handwriting fonts,
stickers/VHS, the 70s eyeball broadcast, the A24 disc library.

## Copy

Plain, deadpan, kind. Specific beats clever. Errors say what happened and what to do.

## Practical rules

- Test at 375px wide and on desktop; the body must never scroll sideways.
- Wrap every `localStorage` access in try/catch.
- Don't hardcode streaming availability; it comes from live data.
- Respect `prefers-reduced-motion` (the peel and flip animations already do).
