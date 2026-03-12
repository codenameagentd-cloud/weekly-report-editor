// Cloudflare Worker: AI Proxy for Weekly Report Editor
// Forwards requests to GitHub Models API with server-side token

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const token = env.GITHUB_TOKEN;
    if (!token) {
      return jsonResponse({ error: 'Server misconfigured: missing API token' }, 500);
    }

    try {
      const body = await request.json();
      
      // Validate required fields
      if (!body.model || !body.messages) {
        return jsonResponse({ error: 'Missing required fields: model, messages' }, 400);
      }

      // Allowlist models
      const allowed = ['gpt-5.2', 'gpt-4.1', 'gpt-4o', 'gpt-5-mini', 'claude-opus-4.6', 'claude-sonnet-4.6', 'gemini-3-pro', 'gemini-3-flash'];
      if (!allowed.includes(body.model)) {
        return jsonResponse({ error: `Model not allowed: ${body.model}` }, 400);
      }

      // Forward to GitHub Models
      const resp = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: body.model,
          messages: body.messages,
          max_tokens: body.max_tokens || 4000,
          temperature: body.temperature ?? 0.4,
        }),
      });

      const data = await resp.text();
      return new Response(data, {
        status: resp.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      return jsonResponse({ error: `Proxy error: ${e.message}` }, 500);
    }
  },
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
