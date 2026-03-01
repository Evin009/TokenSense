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
| Frontend       | Next.js 16 + React 19   | Web demo, dashboard, playground          |
| Backend        | FastAPI + Python 3.11+  | Async API server                         |
| CLI            | Typer                   | Developer command-line interface         |
| Vector DB      | Actian VectorAI DB      | Semantic retrieval (Docker)              |
| Model Routing  | OpenRouter API          | Multi-model abstraction                  |
| Fallback LLM   | Gemini API              | Advanced reasoning fallback              |
| Auth           | API Key Middleware       | X-API-Key header validation              |
| Caching        | functools.lru_cache     | Embedding/query result caching           |
| Persistence    | SQLite                  | Telemetry logs survive restarts          |
| Dev Scripts    | Shell (dev.sh)          | Single command to start all services     |
| Animations     | framer-motion           | Page transitions and interactive effects |
| Charts         | recharts                | Dashboard analytics visualizations       |
| Icons          | lucide-react            | UI iconography                           |
| Testing        | pytest / Jest / Playwright | Backend, frontend, and E2E tests      |
| Deployment     | Docker + Caddy          | Containerized prod deployment            |

---

## Build Phases

### Phase 1 — Documentation (Current)
- [x] Create `CLAUDE.md` (this file)
- [x] Create `docs/BACKEND_PLAN.md`
- [x] Create `docs/FRONTEND_PLAN.md`

### Phase 2 — Backend ✅
> See `docs/BACKEND_PLAN.md` for detailed step-by-step instructions.

- [x] Scaffold `backend/` directory structure
- [x] Create `.env.example` with all required keys
- [x] Implement `backend/utils/auth.py` (API key middleware)
- [x] Implement `backend/utils/db.py` (SQLite telemetry)
- [x] Implement `backend/agents/query_agent.py`
- [x] Implement `backend/agents/retrieval_agent.py`
- [x] Implement `backend/agents/context_optimizer.py`
- [x] Implement `backend/agents/routing_agent.py`
- [x] Implement `backend/agents/telemetry_agent.py`
- [x] Implement `backend/routers/index_router.py` → `POST /index`
- [x] Implement `backend/routers/ask_router.py` → `POST /ask`
- [x] Implement `backend/routers/optimize_router.py` → `POST /optimize`
- [x] Implement `backend/routers/stats_router.py` → `GET /stats`
- [x] Implement `backend/routers/keys_router.py` → `POST /keys` (API key generation)
- [x] Wire all routers in `backend/main.py`
- [x] Create `backend/requirements.txt`

### Phase 3 — Frontend ✅
> See `docs/FRONTEND_PLAN.md` for per-page design specs and Pencil.dev instructions.

- [x] Initialize Next.js 16 project (`frontend/`) with TypeScript + Tailwind v4 + App Router
- [x] Install: shadcn/ui, recharts, lucide-react, framer-motion, radix-ui, react-markdown
- [x] Create `frontend/src/lib/api.ts` — typed API client
- [x] Create `frontend/src/lib/types.ts` — TypeScript interfaces
- [x] Create `frontend/src/lib/utils.ts` — formatting helpers
- [x] Create `frontend/src/lib/docs-content.ts` — structured documentation data
- [x] Build shared components: `navbar.tsx`, `api-key-modal.tsx`, `hero-bg.tsx`, `cursor-glow.tsx`, `copy-button.tsx`
- [x] Build Landing page (`/`) — animations, pipeline viz, API key generation, token savings demo
- [x] Build Playground page (`/playground`) — split-panel query UI, budget slider, metadata cards
- [x] Build Dashboard page (`/dashboard`) — sidebar, charts (area/bar/stacked), sortable queries table
- [x] Build Docs page (`/docs`) — 3-column layout, search, code blocks, TOC

### Phase 4 — CLI ✅
- [x] Create `cli/tokensense.py` with Typer
- [x] Implement `tokensense init` — scaffold config at `~/.tokensense/config` (with `--demo` flag)
- [x] Implement `tokensense index <path>` — calls `POST /index` (with `--ext` filter, progress spinner)
- [x] Implement `tokensense ask "<query>"` — calls `POST /ask`, prints rich table response
- [x] Implement `tokensense stats` — calls `GET /stats`, prints summary panel + recent queries
- [x] Create `cli/requirements.txt`

### Phase 5 — Integration & Dev Scripts ✅
- [x] Create `dev.sh` — starts backend + frontend with one command
- [x] Create `.env.example` (if not done in Phase 2)
- [x] Configure CORS in FastAPI for `http://localhost:3000`
- [x] Document Docker command for Actian VectorAI DB in README.md
- [x] End-to-end test: index → ask → view in dashboard
- [x] Create `docker-compose.yml` — orchestrates Actian, backend, and frontend with healthchecks

### Phase 6 — Testing ✅
- [x] Backend: `tests/backend/` — 10 pytest files covering all agents, routers, and utils (mocked)
- [x] Frontend: `tests/frontend/` — Jest + React Testing Library (api, utils, navbar, landing)
- [x] E2E: `tests/e2e/` — Playwright specs (landing, navigation, playground, docs)
- [x] Create `tests/README.md` — testing guide

### Phase 7 — Deployment ✅
- [x] Create `backend/Dockerfile`
- [x] Create `frontend/Dockerfile`
- [x] Create `deploy/setup-vultr.sh` — automated Vultr VPS provisioning script
- [x] Create `deploy/Caddyfile` — reverse proxy with automatic HTTPS
- [x] Document deployment steps in `docs/VULTR_SETUP.md`

---

## Key Conventions

| Convention        | Value                                              |
| ----------------- | -------------------------------------------------- |
| API auth header   | `X-API-Key`                                        |
| API key env var   | `TOKENSENSE_API_KEY`                               |
| Backend port      | `8000`                                             |
| Frontend port     | `3000`                                             |
| Vector DB port    | `50051` (Actian gRPC, no auth required)            |
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
├── pyproject.toml                   ← Python package metadata (v0.1.4)
├── .env.example                     ← environment variable template
├── .env                             ← local secrets (gitignored)
├── dev.sh                           ← starts backend + frontend
├── docker-compose.yml               ← orchestrates Actian, backend, frontend
├── docs/
│   ├── BACKEND_PLAN.md              ← ordered backend build instructions
│   ├── FRONTEND_PLAN.md             ← per-page frontend specs + Pencil.dev prompts
│   ├── PRODUCT_SUMMARY.md           ← product overview
│   ├── USER_GUIDE.md                ← end-user documentation
│   └── VULTR_SETUP.md               ← cloud deployment guide
├── backend/
│   ├── main.py                      ← FastAPI app entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── agents/
│   │   ├── query_agent.py           ← embeddings + task classification
│   │   ├── retrieval_agent.py       ← Actian VectorAI DB search
│   │   ├── context_optimizer.py     ← dedup, compress, token budget
│   │   ├── routing_agent.py         ← model selection + LLM calls
│   │   └── telemetry_agent.py       ← cost calc + SQLite logging
│   ├── routers/
│   │   ├── index_router.py          ← POST /index
│   │   ├── ask_router.py            ← POST /ask
│   │   ├── optimize_router.py       ← POST /optimize
│   │   ├── stats_router.py          ← GET /stats
│   │   └── keys_router.py           ← POST /keys (API key generation)
│   ├── utils/
│   │   ├── auth.py                  ← verify_api_key dependency
│   │   └── db.py                    ← SQLite helpers (telemetry + api_keys tables)
│   └── data/
│       └── telemetry.db             ← SQLite database (persisted)
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             ← Landing (/)
│   │   │   ├── layout.tsx
│   │   │   ├── template.tsx
│   │   │   ├── playground/page.tsx  ← Playground (/playground)
│   │   │   ├── dashboard/page.tsx   ← Dashboard (/dashboard)
│   │   │   └── docs/page.tsx        ← Docs (/docs)
│   │   ├── components/
│   │   │   ├── navbar.tsx
│   │   │   ├── api-key-modal.tsx
│   │   │   ├── hero-bg.tsx
│   │   │   ├── cursor-glow.tsx
│   │   │   └── copy-button.tsx
│   │   └── lib/
│   │       ├── api.ts               ← typed API client
│   │       ├── types.ts             ← TypeScript interfaces
│   │       ├── utils.ts             ← formatting helpers
│   │       └── docs-content.ts      ← structured documentation data
├── cli/
│   ├── tokensense.py                ← Typer CLI entry point
│   └── requirements.txt
├── tests/
│   ├── README.md                    ← testing guide
│   ├── backend/                     ← pytest (10 files, all mocked)
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_db.py
│   │   ├── test_query_agent.py
│   │   ├── test_routing_agent.py
│   │   ├── test_context_optimizer.py
│   │   ├── test_telemetry_agent.py
│   │   ├── test_ask_router.py
│   │   ├── test_index_router.py
│   │   ├── test_optimize_router.py
│   │   └── test_stats_router.py
│   ├── frontend/                    ← Jest + React Testing Library
│   │   └── __tests__/
│   │       ├── api.test.ts
│   │       ├── utils.test.ts
│   │       ├── navbar.test.tsx
│   │       └── landing.test.tsx
│   └── e2e/                         ← Playwright
│       └── tests/
│           ├── landing.spec.ts
│           ├── navigation.spec.ts
│           ├── playground.spec.ts
│           └── docs.spec.ts
└── deploy/
    ├── setup-vultr.sh               ← automated VPS provisioning
    └── Caddyfile                    ← reverse proxy + HTTPS
```

---

## Environment Variables Required

```bash
# .env (copy from .env.example)
TOKENSENSE_API_KEY=your-secret-api-key
OPENROUTER_API_KEY=sk-or-...
GEMINI_API_KEY=AIza...

# Actian VectorAI DB — gRPC, no auth required
ACTIAN_HOST=localhost
ACTIAN_PORT=50051
```

> **Actian client install:** Download `actiancortex-0.1.0b1-py3-none-any.whl` from
> https://github.com/hackmamba-io/actian-vectorAI-db-beta and run:
> `pip install actiancortex-0.1.0b1-py3-none-any.whl`
