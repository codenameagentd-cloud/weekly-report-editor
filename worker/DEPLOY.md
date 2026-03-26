# Deploy AI Proxy Worker

## Prerequisites
- Node.js, wrangler CLI
- Cloudflare account (free tier)

## Steps

1. Login to Cloudflare:
```bash
wrangler login
```

2. Set Azure OpenAI secrets:
```bash
cd worker/
wrangler secret put AZURE_OPENAI_ENDPOINT
# Paste: https://cwcdavid1983-0016-resource.services.ai.azure.com
wrangler secret put AZURE_OPENAI_KEY
# Paste the API key
```

3. Deploy:
```bash
wrangler deploy
```

4. Update `index.html` — replace the AI endpoint URL with your Worker URL.

## Models
- Default generate: claude-opus-4-6 (serverless on Azure AI)
- Default polish: gpt-4o-mini (deployed on Azure OpenAI)
- Override via request body `model` field
