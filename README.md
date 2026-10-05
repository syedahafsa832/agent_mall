# Agent Mall — Frontend

Customer-facing Next.js frontend for the Agent Mall shopping agent: search, compare, auctions, merchant dashboard, auth, and profile. Talks to the backend over HTTP — no server logic or database access lives here.

Backend: https://github.com/syedahafsa12/backend_agentic_mall

## Run locally

**Start the backend first.** Ports are pinned (backend 3000, frontend 3001) —
if the backend isn't already up on 3000 when this starts, or if anything else
is already using 3000/3001, Next.js will silently fall back to a different
port and this app will end up calling the wrong backend origin (symptoms: 404s,
login failing). See `../backend/README.md`.

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL should point at the backend, default http://localhost:3000
npm run dev                  # always http://localhost:3001 (port is pinned, no auto-fallback)
```

## Environment variables

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | Base URL of the backend API, e.g. `http://localhost:3000` |

Never commit `.env`; it is gitignored.
