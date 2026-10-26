// Serves the static site from public/, plus one API route:
//   GET /api/art?q=<kind>:<title>:<year>,...   -> { "<kind>:<title>:<year>": { poster, backdrop } }
// Posters and stills come from the TMDB API using the TMDB_TOKEN secret
// (Worker → Settings → Variables and Secrets). Without the secret the route
// answers { error: "no-token" } and the page keeps its printed disc labels.

const TMDB = 'https://api.themoviedb.org/3';
const DAY = 60 * 60 * 24;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/art') return art(url, env, ctx);
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
    const [kind, title, year] = key.split(':');
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

function json(body, status, maxAge) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${maxAge}` },
  });
}
