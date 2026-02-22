# TokenSense — Backend Build Plan

Ordered, step-by-step implementation guide. Work through each step in sequence. Do not skip ahead — each step creates a dependency for the next.

---

## Step 1 — Scaffold Directory Structure

Create the following empty structure before writing any logic:

```
backend/
├── agents/
│   └── __init__.py
├── routers/
│   └── __init__.py
├── utils/
│   └── __init__.py
├── data/                  ← SQLite database lives here (gitignored)
├── main.py
└── requirements.txt
```

**`backend/requirements.txt`** — pin exact versions for reproducibility:
```
fastapi==0.111.0
uvicorn[standard]==0.30.1
httpx==0.27.0
python-dotenv==1.0.1
typer==0.12.3
pydantic==2.7.1
aiosqlite==0.20.0
```

Add Actian VectorAI DB client package once the exact PyPI package name is confirmed (check Actian docs).

---

## Step 2 — Environment & Auth Middleware

### `.env.example` (project root)
```bash
TOKENSENSE_API_KEY=your-secret-api-key-here
OPENROUTER_API_KEY=sk-or-...
GEMINI_API_KEY=AIza...
ACTIAN_HOST=localhost
ACTIAN_PORT=5439
ACTIAN_DB=tokensense
ACTIAN_USER=actian
ACTIAN_PASSWORD=change-me
```

Copy to `.env` and fill in real values. `.env` must be in `.gitignore`.

### `backend/utils/auth.py`

Implement a FastAPI dependency that validates the `X-API-Key` header:

```
- Read TOKENSENSE_API_KEY from environment via python-dotenv
- Define: async def verify_api_key(x_api_key: str = Header(...)) -> None
- If x_api_key != TOKENSENSE_API_KEY: raise HTTPException(401, "Invalid API key")
- Return None on success (used as a dependency, not a value)
```

**Usage in routes:**
```python
@router.post("/ask", dependencies=[Depends(verify_api_key)])
```

---

## Step 3 — SQLite Database Layer

### `backend/utils/db.py`

Responsibilities:
- Initialize the SQLite database on startup (create tables if not exist)
- Provide async insert and query helpers for telemetry data

**Schema — `telemetry` table:**
```sql
CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    query_snippet TEXT,
    model_used TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    optimized_tokens INTEGER,
    cost_usd REAL,
    latency_ms INTEGER
);
```

**Helpers to implement:**
- `async def init_db()` — runs CREATE TABLE IF NOT EXISTS on startup
- `async def log_query(record: dict)` — inserts one telemetry row
- `async def get_stats(limit: int = 100) -> list[dict]` — returns recent telemetry rows
- `async def get_summary() -> dict` — returns aggregates: total queries, avg token reduction %, total cost, avg latency

Use `aiosqlite` for all async DB operations. DB file path: `backend/data/telemetry.db`.

---

## Step 4 — Agent Modules

Implement agents in the order listed. Each agent has one responsibility.

### 4.1 `backend/agents/query_agent.py`

**Responsibility:** Convert a raw user query into a semantic embedding and classify the task type.

```
Input:  query: str
Output: { "embedding": list[float], "task_type": str, "token_estimate": int }

task_type values: "code", "documentation", "general"
```

**Implementation notes:**
- Call OpenRouter API with model `openai/text-embedding-ada-002` to get the embedding
- Classify task_type by scanning the query for keywords:
  - Contains "def ", "class ", "import", "function" → "code"
  - Contains "how to", "explain", "what is" → "documentation"
  - Default → "general"
- Use `@functools.lru_cache` on the embedding call (cache by query string)
- token_estimate: `len(query.split()) * 1.3` (rough estimate, refine later)

---

### 4.2 `backend/agents/retrieval_agent.py`

**Responsibility:** Query Actian VectorAI DB with the embedding and return the top-k most relevant context chunks.

```
Input:  embedding: list[float], top_k: int = 5
Output: list[{ "content": str, "score": float, "source": str }]
```

**Implementation notes:**
- Connect to Actian VectorAI DB using env vars (ACTIAN_HOST, PORT, DB, USER, PASSWORD)
- Perform a cosine similarity search with the embedding
- Return results sorted by score descending
- If the DB is unreachable, return an empty list and log a warning (do not crash)
- For the hackathon: if the Actian client SDK is complex to integrate quickly, stub this with a mock that returns 3 hardcoded relevant chunks — mark clearly with `# TODO: replace with real Actian client`

---

### 4.3 `backend/agents/context_optimizer.py`

**Responsibility:** Take raw retrieved chunks and compress/deduplicate them to fit within a token budget.

```
Input:  chunks: list[dict], token_budget: int = 8000, query: str
Output: { "optimized_context": str, "original_tokens": int, "optimized_tokens": int }
```

**Implementation notes:**
- Step 1 — Deduplication: remove chunks where `content` has >80% overlap with another (simple substring check is fine)
- Step 2 — Relevance re-ranking: sort chunks by `score` descending (already sorted from retrieval, but re-confirm)
- Step 3 — Truncation: concatenate chunks until the running token count would exceed `token_budget`; stop before exceeding
- Token counting: use `len(text.split()) * 1.3` as a fast approximation (no tiktoken dependency needed)
- Prefix each chunk with `[Source: {source}]\n` before concatenation
- Track `original_tokens` (sum of all chunk tokens before compression) and `optimized_tokens` (final output token count)

---

### 4.4 `backend/agents/routing_agent.py`

**Responsibility:** Select the best LLM model given the query characteristics and task type.

```
Input:  task_type: str, token_estimate: int, optimized_tokens: int
Output: { "model": str, "provider": str, "reason": str }
```

**Routing logic (implement as a decision tree):**

```
if task_type == "code" OR optimized_tokens > 6000:
    model = "google/gemini-pro"
    provider = "gemini"
    reason = "Code/large context → Gemini Pro"

elif task_type == "documentation" OR optimized_tokens > 3000:
    model = "openai/gpt-4o-mini"
    provider = "openrouter"
    reason = "Documentation/medium context → GPT-4o mini"

else:  # general, small context
    model = "anthropic/claude-3-haiku"
    provider = "openrouter"
    reason = "General/small context → Claude Haiku (fast + cheap)"
```

**LLM call logic:**
- If provider == "openrouter": POST to `https://openrouter.ai/api/v1/chat/completions` with `OPENROUTER_API_KEY`
- If provider == "gemini": use Gemini REST API with `GEMINI_API_KEY`
- Return the raw response text + model metadata

---

### 4.5 `backend/agents/telemetry_agent.py`

**Responsibility:** Calculate cost, record token counts, measure latency, and persist to SQLite.

```
Input:  {
    query: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    optimized_tokens: int,
    latency_ms: int
}
Output: { "cost_usd": float, "record_id": int }
```

**Cost calculation (approximate per-token pricing):**
```
PRICE_PER_1K_TOKENS = {
    "anthropic/claude-3-haiku":   {"input": 0.00025, "output": 0.00125},
    "openai/gpt-4o-mini":         {"input": 0.00015, "output": 0.00060},
    "google/gemini-pro":          {"input": 0.00050, "output": 0.00150},
}
cost = (input_tokens / 1000 * price["input"]) + (output_tokens / 1000 * price["output"])
```

- Call `db.log_query(record)` to persist
- Return the inserted row ID and calculated cost

---

## Step 5 — API Routers

All routes require `Depends(verify_api_key)`. Use `APIRouter` with a prefix.

### `backend/routers/index_router.py` — `POST /index`

```
Request body: { "path": str, "file_extensions": list[str] = [".py", ".ts", ".md"] }
Response:     { "indexed_files": int, "chunks": int, "status": "ok" }
```

Logic:
1. Walk the given path, read matching files
2. Split file contents into chunks (~500 tokens each, split on newlines)
3. Call `query_agent.embed(chunk)` for each chunk
4. Store embedding + content + source path in Actian VectorAI DB
5. Return count of files and chunks indexed

---

### `backend/routers/ask_router.py` — `POST /ask`

```
Request body: { "query": str, "token_budget": int = 8000 }
Response:     {
    "answer": str,
    "model": str,
    "input_tokens": int,
    "output_tokens": int,
    "optimized_tokens": int,
    "cost_usd": float,
    "latency_ms": int,
    "context_reduction_pct": float
}
```

Logic (full pipeline):
1. Record start time
2. `query_agent.process(query)` → embedding + task_type
3. `retrieval_agent.fetch(embedding)` → chunks
4. `context_optimizer.optimize(chunks, token_budget, query)` → optimized_context
5. `routing_agent.route(task_type, ...)` → model selection + LLM call → answer
6. Record end time → latency_ms
7. `telemetry_agent.record(...)` → cost + persist
8. Return full response object

---

### `backend/routers/optimize_router.py` — `POST /optimize`

```
Request body: { "query": str, "token_budget": int = 8000 }
Response:     {
    "optimized_context": str,
    "original_tokens": int,
    "optimized_tokens": int,
    "reduction_pct": float,
    "chunks_retrieved": int
}
```

Same as `/ask` pipeline but stops before the LLM call. Returns context optimization results only. Useful for the Playground's "Optimize Context" toggle.

---

### `backend/routers/stats_router.py` — `GET /stats`

```
Query params: limit (int, default 100)
Response: {
    "summary": {
        "total_queries": int,
        "avg_token_reduction_pct": float,
        "total_cost_usd": float,
        "avg_latency_ms": int
    },
    "recent_queries": [ ...telemetry rows... ]
}
```

Calls `db.get_summary()` and `db.get_stats(limit)`.

---

## Step 6 — Wire `backend/main.py`

```python
# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from utils.db import init_db
from routers import index_router, ask_router, optimize_router, stats_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="TokenSense API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(index_router.router, prefix="/index", tags=["Index"])
app.include_router(ask_router.router, prefix="/ask", tags=["Ask"])
app.include_router(optimize_router.router, prefix="/optimize", tags=["Optimize"])
app.include_router(stats_router.router, prefix="/stats", tags=["Stats"])

@app.get("/")
async def health():
    return {"status": "ok", "service": "TokenSense"}
```

---

## Step 7 — Dev Scripts

### `dev.sh` (project root, chmod +x)

```bash
#!/bin/bash
set -e

echo "Starting TokenSense..."
echo ""

# Start backend
echo "[backend] Starting FastAPI on :8000"
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "[frontend] Starting Next.js on :3000"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
```

### Docker command for Actian VectorAI DB

Document this in README.md:
```bash
docker pull actian/vector:latest
docker run -d \
  --name tokensense-vectordb \
  -p 5439:5439 \
  -e ACTIAN_PASSWORD=change-me \
  actian/vector:latest
```

Verify: `docker ps` should show `tokensense-vectordb` running.

---

## Implementation Order Checklist

```
[ ] Step 1: Scaffold dirs + requirements.txt
[ ] Step 2: .env.example + utils/auth.py
[ ] Step 3: utils/db.py (SQLite)
[ ] Step 4.1: agents/query_agent.py
[ ] Step 4.2: agents/retrieval_agent.py
[ ] Step 4.3: agents/context_optimizer.py
[ ] Step 4.4: agents/routing_agent.py
[ ] Step 4.5: agents/telemetry_agent.py
[ ] Step 5a: routers/index_router.py
[ ] Step 5b: routers/ask_router.py
[ ] Step 5c: routers/optimize_router.py
[ ] Step 5d: routers/stats_router.py
[ ] Step 6: main.py (wire everything)
[ ] Step 7: dev.sh
[ ] Smoke test: curl -H "X-API-Key: ..." http://localhost:8000/
```

---

## Testing Each Layer

**Auth:**
```bash
curl http://localhost:8000/ask -d '{"query":"test"}' -H "Content-Type: application/json"
# Expected: 422 (missing API key header)

curl http://localhost:8000/ask -d '{"query":"test"}' \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong-key"
# Expected: 401 Unauthorized
```

**Full pipeline:**
```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $TOKENSENSE_API_KEY" \
  -d '{"query": "what does this project do?", "token_budget": 4000}'
```

**Stats:**
```bash
curl http://localhost:8000/stats \
  -H "X-API-Key: $TOKENSENSE_API_KEY"
```

---

## Phase 6 — Vultr Cloud Deployment

Deploy the full TokenSense stack to Vultr so users can `pip install tokensense` and connect to a hosted API without running anything locally.

### Architecture

```
User's Machine                           Vultr Cloud Compute
─────────────                           ────────────────────
                                      ┌───────────────────────────┐
pip install tokensense                │  Ubuntu 22.04 VPS         │
     │                                │                           │
     │  tokensense init               │  ┌───────────────────┐   │
     │  tokensense index              │  │ Caddy (HTTPS)     │   │
     │  tokensense ask  ──────────────┼──│  :443 → :8000     │   │
     │                                │  │  :443 → :3000     │   │
     │  Browser ──────────────────────┼──│                    │   │
     │                                │  └───────┬───────────┘   │
                                      │          │               │
                                      │  ┌───────▼───────────┐   │
                                      │  │ FastAPI Backend    │   │
                                      │  │  :8000 (internal)  │   │
                                      │  └───────┬───────────┘   │
                                      │          │               │
                                      │  ┌───────▼───────────┐   │
                                      │  │ Actian VectorAI DB │   │
                                      │  │  :50051 (internal) │   │
                                      │  └───────────────────┘   │
                                      │                           │
                                      │  ┌───────────────────┐   │
                                      │  │ Next.js Frontend   │   │
                                      │  │  :3000 (internal)  │   │
                                      │  └───────────────────┘   │
                                      │                           │
                                      └───────────────────────────┘
```

---

### Step 6.1 — Create Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Actian VectorAI DB client
COPY actiancortex-0.1.0b1-py3-none-any.whl .
RUN pip install actiancortex-0.1.0b1-py3-none-any.whl && rm actiancortex-0.1.0b1-py3-none-any.whl

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Step 6.2 — Create Caddyfile

Create `deploy/Caddyfile` for automatic HTTPS reverse proxy:

```
api.tokensense.dev {
    reverse_proxy backend:8000
}

tokensense.dev {
    reverse_proxy frontend:3000
}
```

Replace `tokensense.dev` with your actual domain. Caddy handles TLS certificate issuance automatically.

---

### Step 6.3 — Create docker-compose.yml

Create `docker-compose.yml` at the project root:

```yaml
version: "3.9"

services:
  actian:
    image: actian/vectorai-db
    ports:
      - "50051"
    restart: unless-stopped
    volumes:
      - actian_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    env_file: .env
    environment:
      - ACTIAN_HOST=actian
      - ACTIAN_PORT=50051
    depends_on:
      - actian
    ports:
      - "8000"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=https://api.tokensense.dev
    depends_on:
      - backend
    ports:
      - "3000"
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deploy/Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  actian_data:
  caddy_data:
  caddy_config:
```

Key design decisions:
- Only Caddy exposes ports 80/443 to the public
- Actian, backend, and frontend are internal-only (no public port bindings)
- `ACTIAN_HOST=actian` uses Docker's internal DNS to resolve the container
- Persistent volumes for Actian data and Caddy TLS certificates

---

### Step 6.4 — Provision Vultr Instance

1. Create account at [vultr.com](https://www.vultr.com)
2. Deploy **Cloud Compute — Optimized** instance:
   - **OS:** Ubuntu 22.04 LTS
   - **Plan:** Optimized Cloud Compute, $12/mo (1 vCPU, 2GB RAM) minimum
   - **Region:** Closest to your demo audience
   - **Label:** `tokensense-prod`
3. Note the public IP address

---

### Step 6.5 — Server Setup Script

Create `deploy/setup-vultr.sh` — run this after SSH-ing into the Vultr VPS:

```bash
#!/bin/bash
set -e

echo "=== TokenSense — Vultr Server Setup ==="

# 1. Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 2. Install Docker Compose plugin
apt-get update && apt-get install -y docker-compose-plugin

# 3. Clone the repo
git clone https://github.com/yourusername/TokenSense.git /opt/tokensense
cd /opt/tokensense

# 4. Create .env from template
cp .env.example .env
echo ""
echo ">>> Edit /opt/tokensense/.env with your real API keys <<<"
echo ">>> Then run: cd /opt/tokensense && docker compose up -d <<<"
```

After running the script and editing `.env`:

```bash
cd /opt/tokensense
docker compose up -d
```

Verify:

```bash
docker compose ps          # all 4 services running
curl http://localhost:8000/ # {"status":"ok","service":"TokenSense"}
```

---

### Step 6.6 — Configure Domain DNS

**Option A — Vultr DNS:**
1. Vultr Dashboard → DNS → Add Domain
2. Add A record: `tokensense.dev` → `<vultr-ip>`
3. Add A record: `api.tokensense.dev` → `<vultr-ip>`

**Option B — External registrar:**
1. In your domain registrar, add A records pointing both subdomains to the Vultr IP

Caddy will automatically obtain HTTPS certificates from Let's Encrypt once DNS propagates.

---

### Step 6.7 — Configure Vultr Firewall

In Vultr Dashboard → Firewall → Create Group → Attach to instance:

| Direction | Protocol | Port  | Source       | Purpose                        |
| --------- | -------- | ----- | ------------ | ------------------------------ |
| Inbound   | TCP      | 22    | Your IP only | SSH access                     |
| Inbound   | TCP      | 80    | Anywhere     | HTTP → Caddy redirects to HTTPS|
| Inbound   | TCP      | 443   | Anywhere     | HTTPS (public API + frontend)  |
| Inbound   | TCP      | 50051 | Drop         | Actian DB never exposed        |
| Inbound   | TCP      | 8000  | Drop         | Backend only reachable via Caddy|

---

### Step 6.8 — Add `--demo` Flag to CLI

Update `tokensense init` to support a `--demo` shortcut:

```
tokensense init --demo
```

This auto-sets the API URL to `https://api.tokensense.dev` and only prompts for the API key. Enables a 30-second onboarding experience for new users and hackathon judges.

---

### Step 6.9 — Verify End-to-End

From any machine (not the server):

```bash
pip install tokensense
tokensense init --demo
# API key: <your-key>

tokensense index ./some-project
tokensense ask "how does authentication work?"
tokensense stats
```

In the browser:
- Visit `https://tokensense.dev` — landing page + playground + dashboard
- Visit `https://api.tokensense.dev/docs` — FastAPI auto-generated Swagger docs

---

### Vultr Deployment Checklist

```
[ ] Step 6.1: backend/Dockerfile created
[ ] Step 6.2: deploy/Caddyfile created
[ ] Step 6.3: docker-compose.yml created
[ ] Step 6.4: Vultr instance provisioned (Optimized Cloud Compute)
[ ] Step 6.5: Server setup — Docker installed, repo cloned, .env configured
[ ] Step 6.6: Domain DNS records pointing to Vultr IP
[ ] Step 6.7: Vultr Firewall rules configured (only 22/80/443 open)
[ ] Step 6.8: CLI --demo flag added to tokensense init
[ ] Step 6.9: End-to-end test from external machine passes
[ ] Bonus: docker compose logs shows healthy services, no errors
```
