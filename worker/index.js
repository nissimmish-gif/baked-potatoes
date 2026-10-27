// Serves the static site from public/, plus one API route:
//   GET /api/art?q=<kind>:<title>:<year>|...   -> { "<kind>:<title>:<year>": { poster, backdrop, id } }
//   GET /api/trailer?kind=movie|tv&id=<tmdb id> -> { key } (a YouTube video id, or null)
//   GET /api/watch?q=<kind>:<tmdb id>|...       -> { country, titles: { "<kind>:<id>": { stream, rent, link } } }
//   GET /api/info?kind=movie|tv&id=<tmdb id>    -> { title, year, runtime, genres, by, cast, rating, votes, overview, seasons }
// Posters and stills come from the TMDB API using the TMDB_TOKEN secret
// (Worker → Settings → Variables and Secrets). Without the secret the route
// answers { error: "no-token" } and the page keeps its placeholder posters.

const TMDB = 'https://api.themoviedb.org/3';
const DAY = 60 * 60 * 24;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // one address for the site: www goes to the bare domain, keeping the path
    if (url.hostname === 'www.watchbakedpotatoes.com') {
      url.hostname = 'watchbakedpotatoes.com';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/api/art') return art(url, env, ctx);
    if (url.pathname === '/api/trailer') return trailer(url, env, ctx);
    if (url.pathname === '/api/info') return info(url, env, ctx);
    if (url.pathname === '/api/watch') return watch(url, request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};

async function art(url, env, ctx) {
  if (!env.TMDB_TOKEN) return json({ error: 'no-token' }, 200, 60);
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  // keys are joined with | because titles can contain commas ("Dude, Where's My Car?")
  const keys = (url.searchParams.get('q') || '').split('|').filter(Boolean).slice(0, 50);
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
      if (first) out[key] = { poster: first.poster_path || null, backdrop: first.backdrop_path || null, id: first.id, title: first.title || first.name || null, date: first.release_date || first.first_air_date || null };
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

// where each title streams in the visitor's country (TMDB's watch providers, which come from
// JustWatch). Service names are tidied so the same service always has one name.
const RENAME = {
  'Disney Plus': 'Disney+', 'Apple TV Plus': 'Apple TV+', 'Apple TV': 'Apple TV', 'Amazon Prime Video': 'Prime Video',
  'Amazon Video': 'Prime Video', 'HBO Max': 'Max', 'Paramount Plus': 'Paramount+', 'Paramount+ with Showtime': 'Paramount+',
  'Paramount Plus Essential': 'Paramount+', 'Paramount Plus Premium': 'Paramount+', 'Peacock Premium': 'Peacock',
  'Peacock Premium Plus': 'Peacock', 'Tubi TV': 'Tubi', 'fuboTV': 'Fubo', 'Netflix basic with Ads': 'Netflix',
};
function serviceName(n) {
  n = n.replace(/ (Standard |Basic )?with Ads$/i, '').replace(/ (Amazon|Apple TV|Roku Premium) Channel$/i, '').trim();
  return RENAME[n] || n;
}
async function watch(url, request, env, ctx) {
  if (!env.TMDB_TOKEN) return json({ error: 'no-token' }, 200, 60);
  const country = /^[A-Z]{2}$/.test(url.searchParams.get('country') || '') ? url.searchParams.get('country') : (request.cf && request.cf.country) || 'US';
  const keys = (url.searchParams.get('q') || '').split('|').filter((k) => /^(movie|tv):\d+$/.test(k)).slice(0, 40);
  const cacheUrl = new URL(url.toString()); cacheUrl.searchParams.set('country', country);
  const cache = caches.default, cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;
  const titles = {};
  await Promise.all(keys.map(async (k) => {
    const [kind, id] = k.split(':');
    try {
      const res = await fetch(`${TMDB}/${kind}/${id}/watch/providers`, { headers: { Authorization: `Bearer ${env.TMDB_TOKEN}`, Accept: 'application/json' } });
      if (!res.ok) { titles[k] = { error: `tmdb-${res.status}` }; return; }
      const r = ((await res.json()).results || {})[country];
      if (!r) { titles[k] = { stream: [], rent: [] }; return; }
      const names = (list) => [...new Set((list || []).sort((a, b) => a.display_priority - b.display_priority).map((p) => serviceName(p.provider_name)))];
      titles[k] = { stream: names([...(r.flatrate || []), ...(r.free || []), ...(r.ads || [])]), rent: names([...(r.rent || []), ...(r.buy || [])]), link: r.link || null };
    } catch (e) {
      titles[k] = { error: 'fetch-failed' };
    }
  }));
  const resp = json({ country, titles }, 200, DAY);
  ctx.waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
}

// the facts for one title, used to keep the catalogue's credits and runtimes right
async function info(url, env, ctx) {
  if (!env.TMDB_TOKEN) return json({ error: 'no-token' }, 200, 60);
  const kind = url.searchParams.get('kind'), id = url.searchParams.get('id') || '';
  if (!['movie', 'tv'].includes(kind) || !/^\d+$/.test(id)) return json({ error: 'bad-request' }, 400, 60);
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;
  try {
    const res = await fetch(`${TMDB}/${kind}/${id}?append_to_response=credits&language=en-US`, {
      headers: { Authorization: `Bearer ${env.TMDB_TOKEN}`, Accept: 'application/json' },
    });
    if (!res.ok) return json({ error: `tmdb-${res.status}` }, 502, 60);
    const d = await res.json();
    const crew = d.credits?.crew || [];
    const out = {
      title: d.title || d.name,
      year: (d.release_date || d.first_air_date || '').slice(0, 4),
      runtime: kind === 'movie' ? d.runtime : (d.episode_run_time || [])[0] || null,
      seasons: kind === 'tv' ? d.number_of_seasons : null,
      episodes: kind === 'tv' ? d.number_of_episodes : null,
      genres: (d.genres || []).map((g) => g.name),
      by: kind === 'movie' ? crew.filter((c) => c.job === 'Director').map((c) => c.name) : (d.created_by || []).map((c) => c.name),
      cast: (d.credits?.cast || []).slice(0, 3).map((c) => c.name),
      rating: d.vote_average, votes: d.vote_count,
      overview: d.overview,
    };
    const resp = json(out, 200, DAY);
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
