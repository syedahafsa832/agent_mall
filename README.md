# Agent Mall — Frontend

Customer-facing Next.js frontend for the Agent Mall shopping agent: search, compare, auctions, merchant dashboard, auth, and profile. Talks to the backend over HTTP — no server logic or database access lives here.

Backend: https://github.com/syedahafsa12/backend_agentic_mall

## Run locally

```bash
npm install
cp .env.example .env     # point NEXT_PUBLIC_API_BASE_URL at a running backend
npm run dev              # http://localhost:3000
```

## Environment variables

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | Base URL of the backend API, e.g. `http://localhost:4000` |

Never commit `.env`; it is gitignored.
