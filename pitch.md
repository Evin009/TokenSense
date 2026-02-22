# TokenSense — 3-Minute Pitch

---

## The Problem

Every AI-powered application wastes money on tokens it never needed to send.

When a developer queries an LLM about their codebase, the typical approach is to dump entire files into the prompt — 20,000, 30,000 tokens — most of it irrelevant. GPT-4 charges ~$30 per million input tokens. At 1,000+ queries a day, costs spiral fast, and teams have **zero visibility** into where the money goes.

Existing tools don't solve this. LangChain gives you building blocks but no optimization — you still send everything. Prompt engineering is manual and doesn't scale. There is no middleware that sits between your app and the LLM and says: *"Send only what matters, to the cheapest model that can handle it."*

**LLM costs are unpredictable, opaque, and unnecessarily high.**

---

## The Solution

**TokenSense is a context engineering engine that optimizes every LLM request before it reaches the model.**

You send a query. TokenSense runs it through a five-step pipeline:

1. **Understand** — embeds the question and classifies the task type
2. **Retrieve** — semantic search pulls only relevant chunks from a vector database
3. **Compress** — deduplicates, re-ranks by relevance, trims to a token budget
4. **Route** — selects the cheapest model that fits (Haiku for simple, GPT-4o Mini for docs, Gemini Pro for code)
5. **Log** — records every token, cost, and millisecond to a telemetry database

The LLM sees less context, but *better* context. You pay less and get better answers.

**Three interfaces, one pipeline:**
- `pip install tokensense` — CLI, works right now
- REST API — drop into any app with one HTTP call
- Web dashboard — real-time cost analytics and a query playground

Published on PyPI (v0.1.4). Live on Vultr. Works today.

---

## The Impact

**Cost reduction:** Input tokens drop 40–70% through retrieval + compression. Routing simple queries to Claude Haiku ($0.25/M) instead of GPT-4 ($30/M) cuts per-token cost by up to 99% on those calls.

**Cost visibility:** Every query is logged — model used, tokens in/out, cost in USD, latency. The dashboard shows exactly where every cent goes, per query, per day, per model.

**Budget control:** A configurable token budget (default 8,000) acts as a hard cap. No query ever sends more than the limit, regardless of how large the codebase is.

**Developer experience:** From `pip install` to optimized query in under 60 seconds. No Docker, no config files, no framework lock-in.

---

## How It Works

```
Your Query
   ↓
[Query Agent]        → Embeds question, classifies task (code / docs / general)
   ↓
[Retrieval Agent]    → Cosine similarity search in Actian VectorAI DB → top-k chunks
   ↓
[Context Optimizer]  → Deduplicates (>80% overlap), re-ranks, enforces token budget
   ↓
[Routing Agent]      → Picks model + calls LLM with compressed context
   ↓
[Telemetry Agent]    → Logs tokens, cost, latency → SQLite
   ↓
Optimized Answer
```

RAG (Retrieval-Augmented Generation) built from scratch — no LangChain, no frameworks. Five independent Python modules, each with a single responsibility.

**Tech stack:**

| Layer | Tech |
|-------|------|
| Backend | FastAPI + Python 3.11 (async) |
| Vector DB | Actian VectorAI DB (gRPC, cosine similarity) |
| LLMs | OpenRouter API (Haiku, GPT-4o Mini) + Gemini API |
| CLI | Typer + Rich → PyPI v0.1.4 |
| Frontend | Next.js 14 + Tailwind + Recharts |
| Telemetry | SQLite via aiosqlite |
| Deployment | Docker Compose on Vultr Cloud Compute |

---

## Sponsor Tracks

### Actian VectorAI DB — 1-Minute Pitch

**"Actian VectorAI DB is the reason TokenSense can find the right code in under 50 milliseconds."**

TokenSense is a RAG-powered context optimization engine — and Actian is its retrieval backbone. Every time a user indexes a codebase, we chunk files into ~150-token blocks, embed each one into a 1536-dimensional vector using `text-embedding-ada-002`, and **batch-upsert** them into an Actian collection with cosine distance. Each chunk carries a payload — the raw content and the source file path — so results come back ready to use.

When a user asks a question, we embed the query and hit Actian's **top-k semantic search**. It returns scored, ranked chunks with full payloads in under 50ms — fast enough to sit inside a real-time optimization pipeline that users never notice.

**Specific Actian features we use:**

- **`create_collection`** — 1536-dim cosine collection matching our embedding model output
- **`batch_upsert`** — indexes entire codebases in one call with deterministic content-hashed IDs (so re-indexing deduplicates automatically)
- **`search` with `with_payload=True`** — returns scored results with content + source metadata, not just IDs
- **`has_collection`** — thread-safe check-before-create pattern with an async lock so concurrent requests don't race
- **`AsyncCortexClient`** — fully async gRPC client, fits natively into our FastAPI async pipeline

**Why Actian over alternatives:**

We needed a vector DB that is lightweight, Docker-native, gRPC-fast, and doesn't require auth setup — Actian checks all four. It runs as a single container (`williamimoh/actian-vectorai-db:1.0b`) in our Docker Compose stack with a persistent named volume. No config files, no cluster setup, no API keys. Start the container, connect on port 50051, go.

**The result:** Actian powers the "R" in our RAG pipeline — fast, reliable semantic retrieval that makes the entire context optimization engine possible.

### Vultr Cloud Compute

The entire production stack runs on Vultr:
- Single `docker-compose up` deploys Actian + backend + frontend on one VPS
- Live at `http://108.61.192.150:8000` — anyone can `pip install tokensense` and connect
- Caddy-ready HTTPS config included for production domains
- Vultr Firewall: only 22/80/443 exposed, vector DB and backend stay internal

### Gemini API

Gemini Pro handles the hardest queries in the routing pipeline:
- All code-related tasks route to Gemini Pro for strong code reasoning
- Large-context queries (>6,000 tokens) go to Gemini for its generous context window
- Direct REST integration via `generativelanguage.googleapis.com` — no wrapper SDK
- Cost tracked separately in telemetry ($0.50/$1.50 per 1K in/out)

---

## What We're Proud Of

**Published to PyPI as a real tool.** Four releases (v0.1.1 → v0.1.4), each fixing packaging issues, entry points, and dependency conflicts. `pip install tokensense` works for anyone in the world.

**RAG from scratch, 105+ tests.** No LangChain. Five independent agents, fully mocked test suite (backend + frontend + E2E), every line hand-written and understood.

---

## Live Demo Flow

```bash
pip install tokensense
tokensense init          # → API URL: http://108.61.192.150:8000
tokensense index ./app   # → indexes codebase into vector DB
tokensense ask "how does payment validation work?"
tokensense stats         # → table of queries, tokens saved, costs
```

Then open `http://108.61.192.150:3000` → playground + dashboard with live charts.

**From install to optimized query in under 60 seconds.**

---

## What's Next

- Streaming responses with real-time token display
- Similarity caching — return cached answers for >90% similar queries
- Output token optimization via `max_tokens` caps and conciseness prompts
- Team features — shared indexes, usage quotas, role-based API keys
- VSCode extension with inline context-optimized code explanations

---

> *"TokenSense makes LLMs affordable. Install it in 5 seconds, save 40–70% on every query, and see exactly where your money goes. It's on PyPI. It's live on Vultr. Try it right now."*
