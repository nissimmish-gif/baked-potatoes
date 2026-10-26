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
glints, paper-grain noise), with a layer of stars that slowly twinkle. Drag a poster to peel it off: right stashes, left passes. Tap
to flip it. Fronts are real TMDB posters once `TMDB_TOKEN` is set; until then, original
placeholder posters in three print styles (torn-paper photo, 80s one-sheet, halftone
screen print). Inspired by real posters, never copies of them. Exception: the three
posters in `public/posters/` (Ferris Bueller's Day Off, The Truman Show, Fight Club) are
the owner's own reference images, used as stand-ins until TMDB is on; delete them then.

The header is a flash card for the poster on top of the stack: its picture, title,
year, runtime, genre and score. It changes as posters are peeled.

Every poster sits in a cream mount with a black frame line. How to use it is said quietly:
one line of small text under the poster ("← pass · tap for the plot · stash →", each a
button), and on a first visit the top poster leans right then left once to show the
gesture, until someone peels or flips. Owner wants these low key, not flash cards. The
filters are called **categories** (not vibes) on the page.

The back of each poster, the header, the nav and the drawers are **vintage flash cards**:
cream paper, a heavy black rounded frame, a flat ink picture (red, violet, pink, sage) with
rough edges and a yellow plate slipped out of register, and a lowercase grotesque label
underneath (Inter Tight). The name is on hold, so the page carries no brand name.
Rejected so far: space gradients, texture everywhere, typewriter/handwriting fonts,
stickers/VHS, the 70s eyeball broadcast, the A24 disc library.

## Copy

Plain, deadpan, kind. Specific beats clever. Errors say what happened and what to do.

## Practical rules

- Test at 375px wide and on desktop; the body must never scroll sideways.
- Wrap every `localStorage` access in try/catch.
- Don't hardcode streaming availability; it comes from live data.
- Respect `prefers-reduced-motion` (the peel and flip animations already do).
