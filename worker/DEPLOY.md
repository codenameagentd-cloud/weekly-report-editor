# Deploy AI Proxy Worker

## Secrets needed:
```bash
cd worker/
wrangler login
wrangler secret put ANTHROPIC_API_KEY        # Claude Opus 4.6
wrangler secret put AZURE_OPENAI_ENDPOINT    # For /polish (GPT-4o-mini)
wrangler secret put AZURE_OPENAI_KEY
wrangler deploy
```
