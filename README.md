# Baked Potatoes

What to watch when you're baked. Movie and TV picks rated with the **Potato Score**,
sorted by vibe, and swiped into **your stash**.

This is the first prototype of the homepage: a night-sky page where a potato bakes
as you scroll, a set of vibe categories, and a swipe deck of movie cards.

## What's here

```
public/          The site. Plain HTML, CSS and JavaScript, no build step.
  index.html     The whole homepage
  potato.webp    The logo potato (used for the scroll bake)
  potato-small.webp
  grain.png      Print-grain overlay tile
brand/logo/      Final logo files (PNG): main logo on night and cream,
                 app icons, transparent potato and wordmark
```

## Run it locally

Any static file server works, for example:

```sh
python3 -m http.server 8000 --directory public
```

Then open http://localhost:8000.

## Deploy on Cloudflare Pages

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick this repository.
3. Build settings: framework preset **None**, build command **empty**, build output directory **`public`**.
4. Deploy. Every push to the production branch redeploys the site.

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
