import { jsonToToon, toonToJson } from '../../../core/toonConverter.js';
import { computeMeta } from '../../../core/tokens.js';

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === '/json-to-toon') {
      try {
        const body = await request.json();
        // jsonToToon expects a JSON string input and now returns { result, meta }
        const obj = jsonToToon(JSON.stringify(body));
        const result = typeof obj === 'string' ? obj : (obj.result ?? obj.text ?? '');
        const meta = obj && typeof obj === 'object' && obj.meta ? obj.meta : computeMeta(result);
        return new Response(JSON.stringify({ toon: result, meta }), 
		{ headers: { 'Content-Type': 'application/json; charset=utf-8',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		} });
      } catch (e) {
        const result = `Error: ${e?.message || String(e)}`;
        const meta = computeMeta(result);
        meta.valid = false;
        meta.warnings = [result];
        return new Response(JSON.stringify({ toon: result, meta }), 
		{ headers: { 'Content-Type': 'application/json; charset=utf-8',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		 } });
      }
    }

    if (url.pathname === '/toon-to-json') {
      try {
        const text = await request.text();
        const obj = toonToJson(text);
        const result = typeof obj === 'string' ? obj : (obj.result ?? obj.text ?? '');
        const meta = obj && typeof obj === 'object' && obj.meta ? obj.meta : computeMeta(result);
        return new Response(JSON.stringify({ json: result, meta }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      } catch (e) {
        const result = `Error: ${e?.message || String(e)}`;
        const meta = computeMeta(result);
        meta.valid = false;
        meta.warnings = [result];
        return new Response(JSON.stringify({ json: result, meta }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
