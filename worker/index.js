// Serves the static site from public/, plus one API route:
//   GET /api/art?q=<kind>:<title>:<year>,...   -> { "<kind>:<title>:<year>": { poster, backdrop, id } }
//   GET /api/trailer?kind=movie|tv&id=<tmdb id> -> { key } (a YouTube video id, or null)
// Posters and stills come from the TMDB API using the TMDB_TOKEN secret
// (Worker → Settings → Variables and Secrets). Without the secret the route
// answers { error: "no-token" } and the page keeps its placeholder posters.

const TMDB = 'https://api.themoviedb.org/3';
const DAY = 60 * 60 * 24;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/art') return art(url, env, ctx);
    if (url.pathname === '/api/trailer') return trailer(url, env, ctx);
    return env.ASSETS.fetch(request);
  },
};

async function art(url, env, ctx) {
  if (!env.TMDB_TOKEN) return json({ error: 'no-token' }, 200, 60);
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const keys = (url.searchParams.get('q') || '').split(',').filter(Boolean).slice(0, 40);
  const out = {};
  await Promise.all(keys.map(async (key) => {
    // titles can contain colons ("Mad Max: Fury Road"), so kind is the first part and year the last
    const parts = key.split(':');
    const kind = parts[0], year = parts.length > 2 ? parts[parts.length - 1] : '';
    const title = parts.slice(1, parts.length > 2 ? -1 : undefined).join(':');
    if (!['movie', 'tv'].includes(kind) || !title) return;
    try {
      const yearParam = kind === 'tv' ? 'first_air_date_year' : 'year';
      const res = await fetch(`${TMDB}/search/${kind}?query=${encodeURIComponent(title)}&${yearParam}=${encodeURIComponent(year || '')}&include_adult=false`, {
        headers: { Authorization: `Bearer ${env.TMDB_TOKEN}`, Accept: 'application/json' },
      });
      if (!res.ok) { out[key] = { error: `tmdb-${res.status}` }; return; }
      const first = (await res.json()).results?.[0];
      if (first) out[key] = { poster: first.poster_path || null, backdrop: first.backdrop_path || null, id: first.id };
    } catch (e) {
      out[key] = { error: 'fetch-failed' };
    }
  }));

  const resp = json(out, 200, DAY);
  ctx.waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
}

async function trailer(url, env, ctx) {
  if (!env.TMDB_TOKEN) return json({ error: 'no-token' }, 200, 60);
  const kind = url.searchParams.get('kind'), id = url.searchParams.get('id') || '';
  if (!['movie', 'tv'].includes(kind) || !/^\d+$/.test(id)) return json({ error: 'bad-request' }, 400, 60);
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;
  try {
    const res = await fetch(`${TMDB}/${kind}/${id}/videos?language=en-US`, {
      headers: { Authorization: `Bearer ${env.TMDB_TOKEN}`, Accept: 'application/json' },
    });
    if (!res.ok) return json({ error: `tmdb-${res.status}` }, 502, 60);
    const vids = ((await res.json()).results || []).filter((v) => v.site === 'YouTube');
    // prefer an official trailer, then any trailer, then a teaser
    const pick = vids.find((v) => v.type === 'Trailer' && v.official) || vids.find((v) => v.type === 'Trailer') || vids.find((v) => v.type === 'Teaser');
    const resp = json({ key: pick ? pick.key : null }, 200, DAY);
    ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    return resp;
  } catch (e) {
    return json({ error: 'fetch-failed' }, 502, 60);
  }
}

function json(body, status, maxAge) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${maxAge}` },
  });
}
