import { jsonToToon, toonToJson } from '../../../core/toonConverter.js';
import { computeMeta } from '../../../core/tokens.js';

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === '/json-to-toon') {
      const body = await request.json();
      // jsonToToon expects a JSON string input and now returns { result, meta }
      const obj = jsonToToon(JSON.stringify(body));
      const result = typeof obj === 'string' ? obj : (obj.result ?? obj.text ?? '');
      const meta = obj && typeof obj === 'object' && obj.meta ? obj.meta : computeMeta(result);
      return new Response(JSON.stringify({ toon: result, meta }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }

    if (url.pathname === '/toon-to-json') {
      const text = await request.text();
      const obj = toonToJson(text);
      const result = typeof obj === 'string' ? obj : (obj.result ?? obj.text ?? '');
      const meta = obj && typeof obj === 'object' && obj.meta ? obj.meta : computeMeta(result);
      return new Response(JSON.stringify({ json: result, meta }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }

    return new Response('Not found', { status: 404 });
  }
};
