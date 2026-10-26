# Working in this repo

Baked Potatoes: a site for what to watch when you're baked. `public/` is the site
(static, no build step). It deploys as a Cloudflare Worker serving `public/` as static
assets (`wrangler.jsonc`); every push to `main` redeploys. Real movie data will be
added to the same Worker (see README).

## Brand decisions (settled with the owner, keep them)

- **Name and score:** Baked Potatoes. The rating is the **Potato Score** (a percentage):
  Fully Loaded 75–100, Half Baked 50–74, Cold Potato 0–49. "Half Baked" is a Ben &
  Jerry's trademark; check before launch.
- **Watchlist vocabulary:** swipe right = **stash it**, left = **pass**; the watchlist
  is **your stash**.
- **Logo:** the traced fingerling potato (from a public-domain USDA photo), 30% chunkier,
  mostly upright leaning right, flipped and mirrored, next to "baked potatoes" in
  **Arimo Bold, lowercase, stacked**. Files in `brand/logo/`. No faces on the potato.
- **Look:** dark night-blue pages (most of the space), cream text, small glowing pops
  (sodium gold, tail-light red, CRT blue). 1970s offset-print feel: flat inks, print
  grain, a second colour slipped slightly out of register. No crisp vector gloss.
- **Movie cards are glass** (blurred, see-through) over the night background; the
  homepage background is never a flat colour.
- **No pot leaves, rasta colours or 420 jokes.** The brand is about the feeling, and
  leaf-free branding is easier to advertise.

## Copy

Plain, deadpan, kind. Specific beats clever. Errors say what happened and what to do.

## Practical rules

- Test at 375px wide and on desktop; the body must never scroll sideways.
- Wrap every `localStorage` access in try/catch.
- Don't hardcode streaming availability; it comes from live data.
- Respect `prefers-reduced-motion` (the smoke and card animations already do).
