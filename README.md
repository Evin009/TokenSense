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

### 1. Start the backend and vector database

TokenSense requires a FastAPI backend and Actian VectorAI DB. Clone the repo and run:

```bash
# Start Actian VectorAI DB (Docker)
docker run -d -p 50051:50051 actian/vectorai-db

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Configure the CLI

```bash
tokensense init
# API URL: http://localhost:8000
# API key: <your-tokensense-api-key>
```

### 3. Index your codebase

```bash
tokensense index ./my-project
```

### 4. Ask questions

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

### 5. View your savings

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

## API Endpoints

Once the backend is running on `http://localhost:8000`:

### `POST /index`
```bash
curl -X POST http://localhost:8000/index \
  -H "X-API-Key: your-key" \
  -d '{"path": "./my-app", "file_extensions": [".py", ".ts"]}'
```

### `POST /ask`
```bash
curl -X POST http://localhost:8000/ask \
  -H "X-API-Key: your-key" \
  -d '{"query": "explain the auth flow", "token_budget": 8000}'
```

### `POST /optimize`
Context optimization only (no LLM call):
```bash
curl -X POST http://localhost:8000/optimize \
  -H "X-API-Key: your-key" \
  -d '{"query": "describe the routing agent", "token_budget": 8000}'
```

### `GET /stats`
```bash
curl http://localhost:8000/stats?limit=20 \
  -H "X-API-Key: your-key"
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
| **Vector DB** | Actian VectorAI DB (Docker) |
| **Model Routing** | OpenRouter API |
| **Fallback LLM** | Gemini API |
| **Frontend** | Next.js 14 + React 18 + Tailwind CSS (planned) |

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
TOKENSENSE_API_KEY=your-secret-api-key
OPENROUTER_API_KEY=sk-or-...
GEMINI_API_KEY=AIza...
ACTIAN_HOST=localhost
ACTIAN_PORT=50051
```

---

## Development

### Run tests

```bash
# Backend + Actian integration tests
cd tests
python test_actian_via_api.py
python test_actian_direct.py
```

### Build the package locally

```bash
pip install build
python -m build
pip install dist/tokensense-0.1.0-py3-none-any.whl
```

---

## License

MIT

---

## Contributing

See `CLAUDE.md` for the full architecture and build plan.
