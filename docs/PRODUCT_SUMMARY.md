# TokenSense — Product Summary

## What It Is

TokenSense is an AI orchestration engine that sits between developers and LLM backends. It intercepts every request and applies semantic retrieval, context compression, and intelligent model routing before the prompt ever reaches the model. The result: up to 72% fewer tokens used, lower costs, and better answers.

## The Problem

When developers use LLMs against their own codebases, they typically dump large amounts of context into the prompt — entire files, lengthy docs, irrelevant code. This wastes tokens, inflates costs, and often degrades response quality because the model has to sift through noise.

## The Solution

TokenSense adds an intelligent middleware layer. Instead of sending raw context to an LLM, it:

1. **Embeds and indexes** your codebase into a vector database
2. **Retrieves only the relevant chunks** for each query via semantic search
3. **Deduplicates and compresses** the context to fit within a configurable token budget
4. **Routes to the best model** based on task complexity and context size
5. **Logs everything** — tokens, cost, latency — for full visibility

## How It Works

```
User Query
  → Query Agent         embeds the question, classifies task type
  → Retrieval Agent     fetches top-k relevant chunks from vector DB
  → Context Optimizer   deduplicates, re-ranks, trims to token budget
  → Routing Agent       picks the best model for the job
  → LLM Call            OpenRouter (Claude/GPT) or Gemini
  → Telemetry Agent     records cost, tokens, latency to SQLite
  → Answer returned
```

## Key Numbers

| Metric | Value |
|--------|-------|
| Avg token reduction | 72% |
| LLM backends supported | 3 (Claude 3 Haiku, GPT-4o Mini, Gemini Pro) |
| Pipeline overhead | <200ms |
| Default token budget | 8,000 tokens (configurable 1k–16k) |

## Interfaces

TokenSense is accessible three ways:

**CLI** — `pip install tokensense`, then `tokensense init`, `tokensense index ./project`, `tokensense ask "your question"`, `tokensense stats`. Published to PyPI as v0.1.1.

**REST API** — FastAPI backend at port 8000 with four endpoints: `POST /index` (embed files), `POST /ask` (full pipeline), `POST /optimize` (context-only preview), `GET /stats` (analytics). All authenticated via `X-API-Key` header.

**Web UI** — Next.js 14 frontend (in progress) with four pages: Landing, Playground, Dashboard, Docs.

## Five-Agent Pipeline

| Agent | What It Does |
|-------|-------------|
| **Query Agent** | Generates embeddings via OpenRouter (text-embedding-ada-002), classifies the task as code, documentation, or general |
| **Retrieval Agent** | Searches Actian VectorAI DB for the top-k most relevant chunks using cosine similarity |
| **Context Optimizer** | Removes duplicates (>80% word overlap), re-ranks by relevance score, truncates to fit the token budget |
| **Routing Agent** | Selects Claude 3 Haiku (small/fast), GPT-4o Mini (medium), or Gemini Pro (code/large) based on task type and context size |
| **Telemetry Agent** | Calculates per-model cost using a pricing table, persists every query's metrics to SQLite |

## Model Routing Logic

| Task Type | Context Size | Model Selected |
|-----------|-------------|----------------|
| General | < 3,000 tokens | Claude 3 Haiku (fastest, cheapest) |
| Documentation | 3,000–6,000 tokens | GPT-4o Mini |
| Code / Large | > 6,000 tokens | Gemini Pro |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.11+ |
| CLI | Typer, httpx, Rich |
| Vector DB | Actian VectorAI DB (Docker, gRPC on port 50051) |
| Model Routing | OpenRouter API |
| Fallback LLM | Google Gemini API |
| Auth | API key middleware (X-API-Key header) |
| Caching | functools.lru_cache on embeddings |
| Telemetry | SQLite (aiosqlite) |
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui, Recharts |
| Deployment | Docker Compose (Actian + Backend), Caddy for HTTPS |

## Project Status

| Phase | Status |
|-------|--------|
| Documentation | Complete |
| Backend (API + 5 agents) | Complete |
| CLI (pip-installable) | Complete |
| Deployment (Docker, Vultr) | Complete |
| Frontend (Next.js) | In progress — designs done, code not started |

## Deployment

A live backend instance runs at `http://108.61.192.150:8000` on Vultr. The CLI supports connecting to it via `tokensense init --demo`. Docker Compose handles Actian VectorAI DB + Backend as a single stack.

## License

MIT
