// Cloudflare Worker: AI Proxy for Weekly Report Editor
// Routes: /polish (GitHub Models) + /generate (Claude full HTML generation)

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);

    if (url.pathname === '/generate') {
      return handleGenerate(request, env);
    }
    // Default: legacy polish route
    return handlePolish(request, env);
  },
};

// ── /generate: Claude full HTML generation ──
async function handleGenerate(request, env) {
  const token = env.GITHUB_TOKEN;
  if (!token) return jsonResponse({ error: 'Missing API token' }, 500);

  try {
    const body = await request.json();
    const { data, style_hint } = body;
    if (!data) return jsonResponse({ error: 'Missing data field' }, 400);

    const systemPrompt = buildSystemPrompt(style_hint);
    const userPrompt = buildUserPrompt(data);

    const resp = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 16000,
        temperature: 0.75,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return jsonResponse({ error: `Model API error: ${resp.status}`, detail: errText }, resp.status);
    }

    const result = await resp.json();
    const html = extractHTML(result.choices?.[0]?.message?.content || '');

    return corsResponse(JSON.stringify({ html, model: 'claude-sonnet-4' }), 200);
  } catch (e) {
    return jsonResponse({ error: `Generate error: ${e.message}` }, 500);
  }
}

// ── Legacy polish route ──
async function handlePolish(request, env) {
  const token = env.GITHUB_TOKEN;
  if (!token) return jsonResponse({ error: 'Missing API token' }, 500);

  try {
    const body = await request.json();
    if (!body.model || !body.messages) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const allowed = ['gpt-5.2', 'gpt-4.1', 'gpt-4o', 'gpt-5-mini', 'claude-opus-4.6', 'claude-sonnet-4.6', 'gemini-3-pro', 'gemini-3-flash'];
    if (!allowed.includes(body.model)) {
      return jsonResponse({ error: `Model not allowed: ${body.model}` }, 400);
    }

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
    return corsResponse(data, resp.status);
  } catch (e) {
    return jsonResponse({ error: `Proxy error: ${e.message}` }, 500);
  }
}

// ── Extract HTML from AI response ──
function extractHTML(content) {
  // Try to extract from code block first
  const match = content.match(/```html?\s*\n([\s\S]*?)```/);
  if (match) return match[1].trim();
  // If starts with <!DOCTYPE or <html, use as-is
  if (content.trim().startsWith('<!') || content.trim().startsWith('<html')) {
    return content.trim();
  }
  return content;
}

// ── System Prompt Builder ──
function buildSystemPrompt(styleHint) {
  const styles = [
    'Swiss Typographic — Helvetica, red/black geometric blocks, asymmetric grid, bold page numbers',
    'Warm Editorial — Earthy tones (#3D2B1F, #F4E8D1), serif headlines, soft shadows, warm gradients',
    'Dark Cinematic — Near-black bg (#0A0A0A), white text, dramatic lighting, wide letter-spacing',
    'Minimal Apple — White bg, SF Pro/Inter, subtle gray borders, extreme whitespace, single accent color',
    'Neon Dashboard — Dark bg, cyan/magenta neon accents, monospace stats, glassmorphism cards',
    'Brutalist Mono — Raw, exposed grid, monospace everything, thick borders, high contrast',
    'Paper & Ink — Off-white (#FAFAF5), black ink aesthetic, thin serif, ruled lines, vintage feel',
    'Gradient Flow — Smooth gradient backgrounds, modern sans, floating cards with blur',
  ];

  const pick = styleHint || styles[Math.floor(Math.random() * styles.length)];

  return `You are a world-class presentation designer. Generate a standalone HTML file for a weekly status report.

STYLE DIRECTION FOR THIS GENERATION:
${pick}

You MUST create a UNIQUE design every time. Never repeat the same layout structure. Vary:
- Color palette and background
- Typography choices and sizing
- Layout structure (asymmetric grids, split layouts, full-bleed, centered, etc.)
- Decorative elements (geometric shapes, lines, gradients, texture)
- Animation style and timing

TECHNICAL REQUIREMENTS:
- Standalone HTML with embedded CSS + JS (no external deps except Google Fonts via @import)
- Slide-based: each section = one full-viewport slide (100vw × 100vh)
- Slide transition: use clip-path or transform animations (NOT scroll-snap)
- Keyboard navigation: ArrowLeft/ArrowRight/ArrowUp/ArrowDown/Space
- Page counter (current/total)
- Responsive (desktop priority, mobile acceptable)
- All animations: 150-500ms, cubic-bezier easing
- 8pt grid spacing system

CONTENT RULES:
- McKinsey style: headline = conclusion, not topic label
- Body ≥ 20px, headlines 36-72pt
- Short content → hero typography with generous whitespace
- Long content → smaller font, may use columns or cards
- Progress items: detect status (done/completed → ✅, in progress → 🔵, blocked → 🔴)
- ALL text must come from user input. NEVER invent content.

SLIDE ORDER:
1. Title — "Weekly Status Update" + date range
2. Summary — user's summary with visual treatment
3. Progress Status — items as cards/rows with status indicators
4. Newsletter (if provided)
5. Others (if provided)
6. Top of Mind (if provided)

QUALITY BAR: This must look like it belongs on Awwwards. Think apple.com presentation quality.

OUTPUT: Complete HTML file ONLY. No markdown fences, no explanation. Start with <!DOCTYPE html>.`;
}

// ── User Prompt Builder ──
function buildUserPrompt(data) {
  let prompt = `Generate the weekly status report HTML with this content:\n\n`;
  prompt += `DATE RANGE: ${data.week || 'This Week'}\n\n`;

  if (data.summary) prompt += `SUMMARY:\n${data.summary}\n\n`;
  if (data.progress) prompt += `PROGRESS STATUS:\n${data.progress}\n\n`;
  if (data.newsletter) prompt += `NEWSLETTER:\n${data.newsletter}\n\n`;
  if (data.others) prompt += `OTHERS:\n${data.others}\n\n`;
  if (data.topOfMind) prompt += `TOP OF MIND:\n${data.topOfMind}\n\n`;

  prompt += `Remember: output ONLY the complete HTML file, starting with <!DOCTYPE html>.`;
  return prompt;
}

// ── Helpers ──
function corsResponse(body, status) {
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
