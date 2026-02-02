import { jsonToToon, toonToJson } from '../../../core/toonConverter.js';

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response('ok');
    }

    if (url.pathname === '/json-to-toon') {
      const body = await request.json();
      // jsonToToon expects a JSON string input
      const result = jsonToToon(JSON.stringify(body));
      return new Response(result, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    if (url.pathname === '/toon-to-json') {
      const text = await request.text();
      const result = toonToJson(text);
      return new Response(result, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }

    return new Response('Not found', { status: 404 });
  }
};
