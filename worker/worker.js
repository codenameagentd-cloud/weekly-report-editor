// Cloudflare Worker: AI Proxy for Weekly Report Editor
// Backend: Azure OpenAI — server-side key only

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return corsResponse(null, 204);
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

    const url = new URL(request.url);
    if (url.pathname === '/generate') return handleGenerate(request, env);
    if (url.pathname === '/polish') return handlePolish(request, env);
    return jsonResponse({ error: 'Not found' }, 404);
  },
};

// ── Azure OpenAI ──
async function azureChat(env, deployment, messages, system, maxTokens = 16000, temperature = 0.75) {
  const endpoint = env.AZURE_OPENAI_ENDPOINT;
  const key = env.AZURE_OPENAI_KEY;
  if (!endpoint || !key) throw new Error('Missing Azure OpenAI credentials');

  const allMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2025-04-01-preview`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': key },
    body: JSON.stringify({ messages: allMessages, max_tokens: maxTokens, temperature }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Azure API ${resp.status}: ${errText}`);
  }
  return resp.json();
}

// ── /generate: Full HTML generation ──
async function handleGenerate(request, env) {
  try {
    const { data, style_hint } = await request.json();
    if (!data) return jsonResponse({ error: 'Missing data field' }, 400);

    const systemPrompt = buildSystemPrompt(style_hint);
    const userPrompt = buildUserPrompt(data);

    // Using gpt-4o-mini for now. Will switch to Claude Opus 4.6 when available.
    const result = await azureChat(
      env, 'gpt-4o-mini',
      [{ role: 'user', content: userPrompt }],
      systemPrompt, 16000, 0.75
    );

    const content = result.choices?.[0]?.message?.content || '';
    const html = extractHTML(content);
    return corsResponse(JSON.stringify({ html, model: 'gpt-4o-mini' }), 200);
  } catch (e) {
    return jsonResponse({ error: `Generate error: ${e.message}` }, 500);
  }
}

// ── /polish ──
async function handlePolish(request, env) {
  try {
    const body = await request.json();
    if (!body.messages) return jsonResponse({ error: 'Missing messages' }, 400);

    const result = await azureChat(env, 'gpt-4o-mini', body.messages, null, body.max_tokens || 4096, body.temperature || 0.3);
    return corsResponse(JSON.stringify(result), 200);
  } catch (e) {
    return jsonResponse({ error: `Polish error: ${e.message}` }, 500);
  }
}

// ── Prompts ──
function buildSystemPrompt(styleHint) {
  return `You are a world-class presentation designer. Generate a complete standalone HTML file for a weekly status report presentation.

REQUIREMENTS:
- Single HTML file, all CSS/JS inline
- Keyboard navigation (← →) between slides
- Print-friendly, Responsive
- NO external dependencies

QUALITY: Awwwards-level. Apple.com presentation quality.

REFERENCE DESIGN PATTERNS:
- Geometric accent elements, slide transitions with clip-path inset animation
- Content animations: staggered slideUp/fadeIn
- Large decorative page numbers (60-80px, light gray)
- Section labels: 12px uppercase, letter-spacing 4px
- Generous whitespace: content occupies ~60% of viewport
- Typography hierarchy: display (60-96px), body (16-20px), label (11-13px)

SLIDES: Cover, Summary, Progress, Newsletter, Others, Top of Mind

${styleHint ? 'STYLE DIRECTION: ' + styleHint : 'STYLE: Choose a distinctive, bold design direction. Each generation should look different.'}

Return ONLY the complete HTML.`;
}

function buildUserPrompt(data) {
  let p = 'Generate the presentation:\n\n';
  for (const [k, v] of Object.entries(data)) {
    if (v) p += `${k.toUpperCase()}:\n${v}\n\n`;
  }
  return p;
}

function extractHTML(content) {
  const m = content.match(/```html\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  if (content.trim().startsWith('<!') || content.trim().startsWith('<html')) return content.trim();
  return content;
}

function corsResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function jsonResponse(obj, status = 200) {
  return corsResponse(JSON.stringify(obj), status);
}
