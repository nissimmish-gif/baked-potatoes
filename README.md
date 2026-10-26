# Baked Potatoes

What to watch when you're baked. Movie and TV picks rated with the **Potato Score**,
sorted by vibe, and swiped into **your stash**.

This is the homepage prototype: a late-night 70s broadcast. A giant cartoon eye whose
pupil dilates as you scroll, a TV-guide list of vibe channels, and printed program cards
to swipe into your stash.

## What's here

```
public/          The site. Plain HTML, CSS and JavaScript, no build step.
  index.html     The whole homepage
  grain.png      Light film-grain overlay
brand/logo/      Logo files from the earlier brand round (PNG)
```

## Run it locally

Any static file server works, for example:

```sh
python3 -m http.server 8000 --directory public
```

Then open http://localhost:8000.

## Deploy on Cloudflare (Workers)

The site deploys as a Cloudflare Worker that serves `public/` (`wrangler.jsonc`). The
same Worker will later hold the movie-data API, so it all stays one project.

1. In the Cloudflare dashboard, go to **Workers & Pages → Create application →**
   import an existing Git repository.
2. Pick **baked-potatoes**. If it isn't listed, GitHub only lets Cloudflare see some of
   your repos: choose the option to manage access (or on GitHub: **Settings →
   Applications → Cloudflare Workers and Pages → Configure**) and add `baked-potatoes`.
3. Settings:
   - **Worker name:** `baked-potatoes` (must match `name` in `wrangler.jsonc`)
   - **Production branch:** `main`
   - **Build command:** leave empty
   - **Deploy command:** `npx wrangler deploy` (the default)
4. **Deploy.** You get an address like `https://baked-potatoes.<your-name>.workers.dev`.
   Every push to `main` redeploys it.

To deploy from a terminal instead: `npm install`, then `npx wrangler deploy`.

## Prototype limits

- **Potato Scores and descriptions are placeholders.** The 21 titles are real; the
  scores and one-liners are editorial picks for the prototype.
- **Where to watch is not live yet.** Cards say "coming soon" instead of listing
  services, because availability changes constantly and shouldn't be hardcoded.
- **The stash is stored in the browser** (`localStorage`), so it doesn't sync between
  devices yet.

## Next: real movie data

The plan is a small **Cloudflare Worker** next to the Pages site:

- It calls the [TMDB API](https://developer.themoviedb.org/) for titles, posters and
  "where to watch" (TMDB's watch-provider data comes from JustWatch and must credit
  JustWatch).
- It keeps the API key secret and caches responses, so the browser never sees the key.
- **Licensing:** TMDB's free API terms cover non-commercial use. If the site earns
  money (ads, affiliate links), it needs a commercial agreement with TMDB first.

## Credits

- Potato traced from a public-domain photo by Scott Bauer, USDA Agricultural Research
  Service ([File:Patates.jpg](https://commons.wikimedia.org/wiki/File:Patates.jpg)).
- Fonts: [Arimo](https://fonts.google.com/specimen/Arimo) and
  [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono), open licence,
  served from Google Fonts.
