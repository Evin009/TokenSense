# TokenSense — Test Suite

Three independent test layers that can be run together or separately.

```
tests/
├── backend/     ← pytest — unit + integration tests for the FastAPI backend
├── frontend/    ← Jest + React Testing Library — component + util tests
└── e2e/         ← Playwright — full browser end-to-end tests
```

---

## Prerequisites

| Tool | Install |
|------|---------|
| Python 3.11+ | already required |
| Node 18+ | already required |
| Playwright browsers | `npx playwright install` (run once) |

---

## 1 — Backend tests (pytest)

Tests every agent, utility, and API endpoint in isolation.
External services (OpenRouter, Gemini, Actian DB) are **fully mocked** — no real keys needed.

```bash
# Install test deps (from project root)
pip install -r tests/backend/requirements-test.txt

# Run all backend tests
pytest tests/backend/ -v

# Run a specific file
pytest tests/backend/test_context_optimizer.py -v

# Run with coverage report
pytest tests/backend/ --cov=backend --cov-report=term-missing -v
```

**What's covered**

| File | Covers |
|------|--------|
| `test_auth.py` | API key validation, 401 / 500 responses |
| `test_db.py` | SQLite init, insert, query, aggregation |
| `test_context_optimizer.py` | Dedup, re-ranking, token budget truncation |
| `test_query_agent.py` | Task classification, token estimation |
| `test_routing_agent.py` | Model selection logic, LLM call dispatch |
| `test_telemetry_agent.py` | Cost calculation per model |
| `test_ask_router.py` | `POST /ask` end-to-end (agents mocked) |
| `test_stats_router.py` | `GET /stats` aggregation |
| `test_index_router.py` | `POST /index` file chunking |
| `test_optimize_router.py` | `POST /optimize` pipeline |

---

## 2 — Frontend tests (Jest)

Tests utility functions, the API client, and React components.

```bash
# Install test deps
cd tests/frontend
npm install

# Run all frontend tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

**What's covered**

| File | Covers |
|------|--------|
| `__tests__/utils.test.ts` | All formatter + helper functions |
| `__tests__/api.test.ts` | API client (fetch mocked) |
| `__tests__/navbar.test.tsx` | Navbar renders, active link |
| `__tests__/landing.test.tsx` | Landing page sections, copy button |

---

## 3 — End-to-end tests (Playwright)

Drives a real browser against the running dev server.
Start the frontend and backend before running E2E tests.

```bash
# Terminal 1 — backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev

# Terminal 3 — run E2E tests
cd tests/e2e
npm install
npx playwright test

# Run a specific spec
npx playwright test tests/landing.spec.ts

# Run in headed (visible) browser mode
npx playwright test --headed

# Open the HTML report after a run
npx playwright show-report
```

**What's covered**

| Spec | Covers |
|------|--------|
| `landing.spec.ts` | Hero, quick-start, agent pipeline, impact cards, CTA links |
| `navigation.spec.ts` | Page transitions between all four routes |
| `playground.spec.ts` | Form input, submit, response panel, settings modal |
| `docs.spec.ts` | Section navigation, search, table of contents |

---

## Running everything in one go

```bash
# From project root
pip install -r tests/backend/requirements-test.txt
pytest tests/backend/ -q

cd tests/frontend && npm install && npm test -- --watchAll=false
cd ../..

cd tests/e2e && npm install && npx playwright test
```
