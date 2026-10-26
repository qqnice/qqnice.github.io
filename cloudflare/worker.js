const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const padletBoardUrl = 'https://padlet.com/qqnice2/ai-s024uq8masebj99bufp3';
const padletFeedUrl = 'https://padlet.com/padlets/s024uq8masebj99bufp3/feed.xml';

function decodeXmlText(value) {
  return value.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1').replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
    (entity, code) => {
      const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
      if (code[0] !== '#') return named[code.toLowerCase()] || entity;
      const point = code[1].toLowerCase() === 'x'
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10);
      return Number.isInteger(point) && point >= 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : entity;
    }
  );
}

function itemField(item, field) {
  const match = item.match(new RegExp(`<${field}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${field}>`, 'i'));
  return match ? decodeXmlText(match[1].trim()) : '';
}

function padletWords(xml) {
  if (!/<rss\b/i.test(xml) || !/<channel\b/i.test(xml)) {
    throw new Error('Unexpected Padlet feed format');
  }
  const counts = new Map();
  const seenIds = new Set();
  let total = 0;
  let index = 0;
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const item = match[1];
    const phrase = itemField(item, 'title').normalize('NFKC')
      .replace(/\s+/g, ' ').trim()
      .replace(/^[，,。.!！?？、;；:： ]+|[，,。.!！?？、;；:： ]+$/g, '');
    const id = itemField(item, 'guid') || itemField(item, 'link') || `item-${index}`;
    index += 1;
    if (!phrase || seenIds.has(id)) continue;
    seenIds.add(id);
    counts.set(phrase, (counts.get(phrase) || 0) + 1);
    total += 1;
  }
  return {
    ok: true,
    counts: [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'))
      .map(([phrase, count]) => ({ phrase, count })),
    total,
    unique: counts.size,
    boardUrl: padletBoardUrl,
    fetchedAt: new Date().toISOString(),
  };
}

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

    if (url.pathname === '/padlet/words') {
      try {
        const feed = await fetch(padletFeedUrl, {
          headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
          cf: { cacheTtl: 3, cacheEverything: true },
        });
        if (!feed.ok) throw new Error(`Padlet RSS returned ${feed.status}`);
        const data = padletWords(await feed.text());
        return response(request.method === 'HEAD' ? null : JSON.stringify(data), 200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=3',
        });
      } catch (error) {
        console.error('Padlet feed request failed', error);
        return response(JSON.stringify({ ok: false, error: 'Padlet feed unavailable' }), 503, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
      }
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
