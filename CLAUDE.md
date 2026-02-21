# TokenSense — CLAUDE.md

## Project Summary

TokenSense is a developer-first AI orchestration engine that intercepts LLM requests and applies semantic retrieval, context compression, and intelligent model routing before sending them to any LLM backend. It reduces token usage, cuts costs, and improves response quality — exposed via a FastAPI backend, a Next.js web UI, and a Typer CLI.

---

## Architecture

```
User Input (CLI / Web)
        │
        ▼
  [Query Agent]            ← generates embeddings, classifies task
        │
        ▼
  [Retrieval Agent]        ← fetches top-k chunks from Actian VectorAI DB
        │
        ▼
  [Context Optimizer]      ← deduplicates, compresses, enforces token budget
        │
        ▼
  [Routing Agent]          ← selects model based on complexity score
        │
     ┌──┴──┐
     ▼     ▼
 OpenRouter  Gemini API
     │     │
     └──┬──┘
        ▼
  [Telemetry Agent]        ← logs tokens, cost, latency to SQLite
        │
        ▼
  Response → CLI / Web UI
```

---

## Tech Stack

| Layer          | Technology              | Purpose                                  |
| -------------- | ----------------------- | ---------------------------------------- |
| Frontend       | Next.js 14 + React 18   | Web demo, dashboard, playground          |
| Backend        | FastAPI + Python 3.11+  | Async API server                         |
| CLI            | Typer                   | Developer command-line interface         |
| Vector DB      | Actian VectorAI DB      | Semantic retrieval (Docker)              |
| Model Routing  | OpenRouter API          | Multi-model abstraction                  |
| Fallback LLM   | Gemini API              | Advanced reasoning fallback              |
| Auth           | API Key Middleware       | X-API-Key header validation              |
| Caching        | functools.lru_cache     | Embedding/query result caching           |
| Persistence    | SQLite                  | Telemetry logs survive restarts          |
| Dev Scripts    | Shell (dev.sh)          | Single command to start all services     |

---

## Build Phases

### Phase 1 — Documentation (Current)
- [x] Create `CLAUDE.md` (this file)
- [x] Create `docs/BACKEND_PLAN.md`
- [x] Create `docs/FRONTEND_PLAN.md`

### Phase 2 — Backend
> See `docs/BACKEND_PLAN.md` for detailed step-by-step instructions.

- [ ] Scaffold `backend/` directory structure
- [ ] Create `.env.example` with all required keys
- [ ] Implement `backend/utils/auth.py` (API key middleware)
- [ ] Implement `backend/utils/db.py` (SQLite telemetry)
- [ ] Implement `backend/agents/query_agent.py`
- [ ] Implement `backend/agents/retrieval_agent.py`
- [ ] Implement `backend/agents/context_optimizer.py`
- [ ] Implement `backend/agents/routing_agent.py`
- [ ] Implement `backend/agents/telemetry_agent.py`
- [ ] Implement `backend/routers/index_router.py` → `POST /index`
- [ ] Implement `backend/routers/ask_router.py` → `POST /ask`
- [ ] Implement `backend/routers/optimize_router.py` → `POST /optimize`
- [ ] Implement `backend/routers/stats_router.py` → `GET /stats`
- [ ] Wire all routers in `backend/main.py`
- [ ] Create `backend/requirements.txt`

### Phase 3 — Frontend
> See `docs/FRONTEND_PLAN.md` for per-page design specs and Pencil.dev instructions.

- [ ] Initialize Next.js 14 project (`frontend/`) with TypeScript + Tailwind + App Router
- [ ] Install: shadcn/ui, recharts, lucide-react
- [ ] Create `frontend/lib/api.ts` — typed API client
- [ ] Build Landing page (`/`)
- [ ] Build Playground page (`/playground`)
- [ ] Build Dashboard page (`/dashboard`)
- [ ] Build Docs page (`/docs`)

### Phase 4 — CLI
- [ ] Create `cli/tokensense.py` with Typer
- [ ] Implement `tokensense init` — scaffold config at `~/.tokensense/config`
- [ ] Implement `tokensense index <path>` — calls `POST /index`
- [ ] Implement `tokensense ask "<query>"` — calls `POST /ask`, prints response
- [ ] Implement `tokensense stats` — calls `GET /stats`, prints table

### Phase 5 — Integration & Dev Scripts
- [ ] Create `dev.sh` — starts backend + frontend with one command
- [ ] Create `.env.example` (if not done in Phase 2)
- [ ] Configure CORS in FastAPI for `http://localhost:3000`
- [ ] Document Docker command for Actian VectorAI DB in README.md
- [ ] End-to-end test: index → ask → view in dashboard

---

## Key Conventions

| Convention        | Value                                              |
| ----------------- | -------------------------------------------------- |
| API auth header   | `X-API-Key`                                        |
| API key env var   | `TOKENSENSE_API_KEY`                               |
| Backend port      | `8000`                                             |
| Frontend port     | `3000`                                             |
| Vector DB port    | `5439` (Actian default)                            |
| Token budget      | `8000` tokens (configurable)                       |
| Embedding model   | OpenRouter — `openai/text-embedding-ada-002`       |
| Default LLM       | OpenRouter auto-routing                            |
| Fallback LLM      | `gemini-pro` via Gemini API                        |
| SQLite path       | `backend/data/telemetry.db`                        |
| Config file       | `~/.tokensense/config` (CLI)                       |

---

## Critical File Paths

```
TokenSense/
├── CLAUDE.md                        ← this file
├── README.md                        ← public-facing project description
├── .env.example                     ← environment variable template
├── dev.sh                           ← starts backend + frontend
├── docs/
│   ├── BACKEND_PLAN.md              ← ordered backend build instructions
│   └── FRONTEND_PLAN.md             ← per-page frontend specs + Pencil.dev prompts
├── backend/
│   ├── main.py                      ← FastAPI app entry point
│   ├── requirements.txt
│   ├── agents/
│   │   ├── query_agent.py
│   │   ├── retrieval_agent.py
│   │   ├── context_optimizer.py
│   │   ├── routing_agent.py
│   │   └── telemetry_agent.py
│   ├── routers/
│   │   ├── index_router.py          ← POST /index
│   │   ├── ask_router.py            ← POST /ask
│   │   ├── optimize_router.py       ← POST /optimize
│   │   └── stats_router.py          ← GET /stats
│   └── utils/
│       ├── auth.py                  ← verify_api_key dependency
│       └── db.py                    ← SQLite helpers
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 ← Landing (/)
│   │   ├── playground/page.tsx      ← Playground (/playground)
│   │   ├── dashboard/page.tsx       ← Dashboard (/dashboard)
│   │   └── docs/page.tsx            ← Docs (/docs)
│   ├── components/
│   └── lib/
│       └── api.ts                   ← typed API client
└── cli/
    └── tokensense.py                ← Typer CLI entry point
```

---

## Environment Variables Required

```bash
# backend/.env (copy from .env.example)
TOKENSENSE_API_KEY=your-secret-api-key
OPENROUTER_API_KEY=sk-or-...
GEMINI_API_KEY=AIza...
ACTIAN_HOST=localhost
ACTIAN_PORT=5439
ACTIAN_DB=tokensense
ACTIAN_USER=actian
ACTIAN_PASSWORD=...
```
