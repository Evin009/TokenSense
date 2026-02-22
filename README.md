# TokenSense

> **AI orchestration engine** — Reduce LLM token usage by up to 72% with semantic retrieval, context compression, and intelligent model routing.

TokenSense sits between you and any LLM backend, transparently optimizing every request. Send only relevant context, pay less, get better answers.

---

## Features

- **Semantic Retrieval** — Vector search powered by Actian VectorAI DB
- **Context Compression** — Deduplicates and trims context to fit your token budget
- **Intelligent Routing** — Auto-selects the best model based on task complexity
- **Multi-Backend** — Works with OpenRouter, Gemini, or any LLM API
- **Full Telemetry** — Tracks tokens, cost, and latency for every query
- **Web Dashboard** — Real-time analytics, model breakdown, token savings charts
- **Per-User API Keys** — Generate and manage API keys via the dashboard or REST endpoint
- **Three Interfaces** — CLI, Web UI, and REST API

---

## Installation

### Option A — Install CLI from PyPI (recommended)

```bash
pip install tokensense
```

### Option B — Install from source

```bash
git clone https://github.com/yourusername/TokenSense.git
cd TokenSense
pip install -e .
```

---

## Quick Start

### Option 1 — One command (Docker Compose)

```bash
cp .env.example .env
# Edit .env with your API keys
docker-compose up
```

This starts the Actian VectorAI DB, FastAPI backend (port 8000), and Next.js frontend (port 3000) together.

### Option 2 — Manual setup

```bash
# 1. Start Actian VectorAI DB
docker run -d -p 50051:50051 actian/vectorai-db

# 2. Set environment variables
cp .env.example .env
# Edit .env with your API keys

# 3. Start the backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 4. Start the frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Configure the CLI

```bash
tokensense init
# API URL: http://localhost:8000
# API key: <your-tokensense-api-key>
```

### Index your codebase

```bash
tokensense index ./my-project
```

### Ask questions

```bash
tokensense ask "how does the authentication flow work?"
```

Output:

```
┌─────────────────── Answer ───────────────────┐
│ The authentication flow uses verify_api_key   │
│ middleware that checks the X-API-Key header…  │
└───────────────────────────────────────────────┘

┌──────────────┬──────────────┐
│ Model        │ claude-haiku │
│ Input tokens │ 2,100        │
│ Reduction    │ 74%          │
│ Cost         │ $0.001200    │
└──────────────┴──────────────┘
```

### View your savings

```bash
tokensense stats
```

---

## CLI Commands

| Command | Description |
|---|---|
| `tokensense init` | Configure API URL and key |
| `tokensense index <path>` | Index a directory into the vector DB |
| `tokensense ask "<query>"` | Send a query through the optimization pipeline |
| `tokensense stats` | View usage analytics and cost savings |

---

## Web UI

Open `http://localhost:3000` after starting the frontend.

| Page | URL | Description |
|---|---|---|
| **Landing** | `/` | Overview, quick-start demo, agent pipeline visualization, impact metrics |
| **Playground** | `/playground` | Interactive query interface with live token counter, response panel, and settings |
| **Dashboard** | `/dashboard` | Telemetry charts, model usage breakdown, token savings over time, API key management |
| **Docs** | `/docs` | Full documentation with search, table of contents, and code examples |

---

## API Endpoints

Once the backend is running on `http://localhost:8000`:

### `POST /ask`
```bash
curl -X POST http://localhost:8000/ask \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"query": "explain the auth flow", "token_budget": 8000}'
```

### `POST /index`
```bash
curl -X POST http://localhost:8000/index \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"path": "./my-app", "file_extensions": [".py", ".ts"]}'
```

### `POST /optimize`
Context optimization only — no LLM call:
```bash
curl -X POST http://localhost:8000/optimize \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"query": "describe the routing agent", "token_budget": 8000}'
```

### `GET /stats`
```bash
curl "http://localhost:8000/stats?limit=20" \
  -H "X-API-Key: your-key"
```

### `POST /keys`
Generate a per-user API key:
```bash
curl -X POST http://localhost:8000/keys \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"label": "my-app"}'
```

---

## Architecture

```
User Input (CLI / Web)
  │
  ├─> Query Agent        (generates embeddings, classifies task)
  ├─> Retrieval Agent    (fetches relevant chunks from Actian VectorAI)
  ├─> Context Optimizer  (deduplicates, compresses, fits token budget)
  ├─> Routing Agent      (selects best model based on complexity)
  ├─> LLM Call           (OpenRouter or Gemini)
  └─> Telemetry Agent    (logs tokens, cost, latency to SQLite)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **CLI** | Typer + httpx + rich |
| **Backend** | FastAPI + Python 3.11+ |
| **Vector DB** | Actian VectorAI DB (Docker, gRPC) |
| **Model Routing** | OpenRouter API |
| **Fallback LLM** | Gemini API |
| **Frontend** | Next.js 14 + React 19 + Tailwind CSS v4 |
| **Animations** | framer-motion |
| **Charts** | recharts |
| **Icons** | lucide-react |
| **Telemetry DB** | SQLite (via aiosqlite) |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
TOKENSENSE_API_KEY=your-secret-api-key
OPENROUTER_API_KEY=sk-or-...
GEMINI_API_KEY=AIza...
ACTIAN_HOST=localhost
ACTIAN_PORT=50051
```

---

## Development

### Start everything with one script

```bash
bash dev.sh
```

### Run tests

**Backend (pytest) — 105 tests, fully mocked, no real API keys needed:**
```bash
pip install -r tests/backend/requirements-test.txt
pytest tests/backend/ -v
```

**Frontend (Jest + React Testing Library):**
```bash
cd tests/frontend
npm install
npm test
```

**End-to-end (Playwright) — requires running dev server:**
```bash
# Terminal 1
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd tests/e2e
npm install
npx playwright test
```

See `tests/README.md` for full test documentation.

### Build the CLI package locally

```bash
pip install build
python -m build
pip install dist/tokensense-0.1.3-py3-none-any.whl
```

---

## License

MIT

---

## Contributing

See `CLAUDE.md` for the full architecture and build plan.
