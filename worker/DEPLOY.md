# Deploy AI Proxy Worker

## Prerequisites
- Node.js installed
- Cloudflare account (free tier is fine)

## Steps

1. Install wrangler:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Set the GitHub token as a secret:
```bash
cd worker/
wrangler secret put GITHUB_TOKEN
# Paste your GitHub Personal Access Token when prompted
```

4. Deploy:
```bash
wrangler deploy
```

5. Note the Worker URL (e.g., `https://wr-ai-proxy.<your-subdomain>.workers.dev`)

6. Update `index.html` — replace the AI endpoint URL with your Worker URL.

## That's it!
Users no longer need to provide a token. The Worker handles auth server-side.
