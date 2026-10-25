const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function response(body, status, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return response(null, 204);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return response('Method not allowed', 405, { Allow: 'GET, HEAD, OPTIONS' });
    }

    if (url.pathname === '/catalog') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT payload FROM lesson_catalog ORDER BY id'
        ).all();
        const catalog = results.map(({ payload }) => JSON.parse(payload));
        return response(request.method === 'HEAD' ? null : JSON.stringify(catalog), 200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        });
      } catch (error) {
        console.error('D1 catalog request failed', error);
        return response(JSON.stringify({ error: 'Catalog unavailable' }), 503, {
          'Content-Type': 'application/json; charset=utf-8',
        });
      }
    }

    if (url.pathname.startsWith('/media/')) {
      let name;
      try {
        name = decodeURIComponent(url.pathname.slice('/media/'.length));
      } catch {
        return response('Invalid path', 400);
      }
      const segments = name.split('/');
      if (!name || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
        return response('Invalid path', 400);
      }
      try {
        const key = `public/${name}`;
        const object = request.method === 'HEAD'
          ? await env.BUCKET.head(key)
          : await env.BUCKET.get(key);
        if (!object) return response('Not found', 404);
        const headers = new Headers(corsHeaders);
        object.writeHttpMetadata(headers);
        headers.set('ETag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=3600');
        headers.set('X-Content-Type-Options', 'nosniff');
        return new Response(request.method === 'HEAD' ? null : object.body, { headers });
      } catch (error) {
        console.error('R2 media request failed', error);
        return response('Media unavailable', 503);
      }
    }

    return response('Not found', 404);
  },
};
