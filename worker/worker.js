// Cloudflare Worker: AI Proxy for Weekly Report Editor
// Backend: Azure OpenAI (server-side key, no client credentials needed)

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

// ── Azure OpenAI chat completions helper ──
async function azureChat(env, model, messages, maxTokens = 16000, temperature = 0.75) {
  const endpoint = env.AZURE_OPENAI_ENDPOINT;
  const key = env.AZURE_OPENAI_KEY;
  if (!endpoint || !key) throw new Error('Missing Azure OpenAI credentials');

  // For Claude models, use the models/chat/completions path (serverless)
  // For GPT models, use the deployments path
  const isServerless = model.startsWith('claude-') || model.startsWith('Llama-') || model.startsWith('DeepSeek-');
  
  let url, headers, body;
  if (isServerless) {
    url = `${endpoint}/models/chat/completions?api-version=2024-05-01-preview`;
    headers = {
      'Content-Type': 'application/json',
      'api-key': key,
    };
    body = { model, messages, max_tokens: maxTokens, temperature };
  } else {
    url = `${endpoint}/openai/deployments/${model}/chat/completions?api-version=2025-04-01-preview`;
    headers = {
      'Content-Type': 'application/json',
      'api-key': key,
    };
    body = { messages, max_tokens: maxTokens, temperature };
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
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
    const { data, style_hint, model } = await request.json();
    if (!data) return jsonResponse({ error: 'Missing data field' }, 400);

    // Default to claude-opus-4-6, allow override
    const useModel = model || 'gpt-4o-mini';
    const systemPrompt = buildSystemPrompt(style_hint);
    const userPrompt = buildUserPrompt(data);

    const result = await azureChat(env, useModel, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 16000, 0.75);

    const html = extractHTML(result.choices?.[0]?.message?.content || '');
    return corsResponse(JSON.stringify({ html, model: useModel }), 200);
  } catch (e) {
    return jsonResponse({ error: `Generate error: ${e.message}` }, 500);
  }
}

// ── /polish: Text polishing ──
async function handlePolish(request, env) {
  try {
    const body = await request.json();
    if (!body.messages) return jsonResponse({ error: 'Missing messages' }, 400);

    const useModel = body.model || 'gpt-4o-mini';
    const result = await azureChat(env, useModel, body.messages, body.max_tokens || 4096, body.temperature || 0.3);

    return corsResponse(JSON.stringify(result), 200);
  } catch (e) {
    return jsonResponse({ error: `Polish error: ${e.message}` }, 500);
  }
}

// ── System prompt for HTML generation ──
function buildSystemPrompt(styleHint) {
  return `You are a world-class presentation designer. Generate a complete standalone HTML file for a weekly status report presentation.

REQUIREMENTS:
- Single HTML file, all CSS/JS inline
- Keyboard navigation (← →) between slides
- Print-friendly
- Responsive
- NO external dependencies

QUALITY: Awwwards-level. Apple.com presentation quality.

REFERENCE DESIGN PATTERNS (from hand-crafted examples):
- Geometric accent elements: colored blocks, vertical bars, positioned absolutely
- Slide transitions: clip-path inset animation (0.5s cubic-bezier)
- Content animations: staggered slideUp/fadeIn with incremental delays
- Large decorative page numbers (60-80px, light gray, bottom-right)
- Section labels: 12px uppercase, letter-spacing 4px
- Progress items: horizontal layout with colored dot indicators
- Generous whitespace: content occupies ~60% of viewport
- Typography hierarchy: one display size (60-96px), one body size (16-20px), one label size (11-13px)

SLIDES (generate all that have content):
1. Cover — title, subtitle, date, author
2. Summary — executive overview
3. Progress — feature status with visual indicators
4. Newsletter — updates, design direction
5. Others — miscellaneous items
6. Top of Mind — current focus/concerns

${styleHint ? 'STYLE DIRECTION: ' + styleHint : 'STYLE: Choose a distinctive, bold design direction. Each generation should look different.'}

Return ONLY the complete HTML. No markdown, no explanation.`;
}

function buildUserPrompt(data) {
  let prompt = 'Generate the presentation with this content:\n\n';
  if (data.title) prompt += `TITLE: ${data.title}\n`;
  if (data.subtitle) prompt += `SUBTITLE: ${data.subtitle}\n`;
  if (data.date) prompt += `DATE: ${data.date}\n`;
  if (data.author) prompt += `AUTHOR: ${data.author}\n`;
  if (data.summary) prompt += `\nSUMMARY:\n${data.summary}\n`;
  if (data.progress) prompt += `\nPROGRESS:\n${data.progress}\n`;
  if (data.newsletter) prompt += `\nNEWSLETTER:\n${data.newsletter}\n`;
  if (data.others) prompt += `\nOTHERS:\n${data.others}\n`;
  if (data.topofmind) prompt += `\nTOP OF MIND:\n${data.topofmind}\n`;
  return prompt;
}

function extractHTML(content) {
  const m = content.match(/```html\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  if (content.trim().startsWith('<!') || content.trim().startsWith('<html')) return content.trim();
  return content;
}

// ── CORS + Response helpers ──
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
