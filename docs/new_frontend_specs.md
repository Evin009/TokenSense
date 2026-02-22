# TokenSense — Frontend Specifications

Functional specification for all four pages of the Next.js 14 frontend. References the existing designs in `design.pen` and the original `FRONTEND_PLAN.md`. This document keeps everything still relevant from the original plan and adds missing functional requirements based on the actual backend implementation.

> **Note:** All visual design (colors, fonts, spacing, layout) is already defined in `design.pen` and the Global Design System in `FRONTEND_PLAN.md`. This document does not change any design, color scheme, or font. It only adds missing **features, behaviors, data bindings, and states**.

---

## API Contract Reference

Every frontend page that calls the backend needs these exact request/response shapes. The API client must send `X-API-Key` and `Content-Type: application/json` headers on every request.

Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

### `GET /` — Health Check

```json
Response: { "status": "ok", "service": "TokenSense", "version": "0.1.0" }
```

### `POST /ask` — Full Pipeline Query

```json
Request:  { "query": "string", "token_budget": 8000 }
Response: {
  "answer": "string",
  "model": "anthropic/claude-3-haiku | openai/gpt-4o-mini | google/gemini-pro",
  "input_tokens": 2100,
  "output_tokens": 107,
  "optimized_tokens": 131,
  "cost_usd": 0.0012,
  "latency_ms": 1032,
  "context_reduction_pct": 74.0
}
```

### `POST /optimize` — Context Optimization Only (No LLM Call)

```json
Request:  { "query": "string", "token_budget": 8000 }
Response: {
  "optimized_context": "string",
  "original_tokens": 8200,
  "optimized_tokens": 2100,
  "reduction_pct": 74.39,
  "chunks_retrieved": 5
}
```

### `POST /index` — Index a Directory

```json
Request:  { "path": "/absolute/path/to/project", "file_extensions": [".py", ".ts", ".md"] }
Response: { "indexed_files": 142, "chunks": 87, "status": "ok" }
```

### `GET /stats?limit=100` — Usage Analytics

```json
Response: {
  "summary": {
    "total_queries": 1284,
    "avg_token_reduction_pct": 68.0,
    "total_cost_usd": 0.0017,
    "avg_latency_ms": 1631
  },
  "recent_queries": [
    {
      "id": 1,
      "timestamp": "2026-02-21T18:30:00Z",
      "query_snippet": "how does the authentication flow work?",
      "model_used": "anthropic/claude-3-haiku",
      "input_tokens": 2100,
      "output_tokens": 107,
      "optimized_tokens": 131,
      "cost_usd": 0.0012,
      "latency_ms": 1032
    }
  ]
}
```

### Model Routing Table

The backend auto-selects a model. These are the three models in the routing agent:

| Model ID                   | Display Name    | When Selected                         |
| -------------------------- | --------------- | ------------------------------------- |
| `anthropic/claude-3-haiku` | Claude 3 Haiku  | General queries, small context        |
| `openai/gpt-4o-mini`      | GPT-4o Mini     | Documentation queries, medium context |
| `google/gemini-pro`        | Gemini Pro      | Code queries, large context (>6k)     |

### Hosted Demo

A live backend runs at `http://108.61.192.150:8000`. The frontend should support switching between local and demo API URLs.

---

## Page 1: Landing Page (`/`)

### Purpose

Public-facing page. Communicates the value proposition, shows how the system works, and drives developers to the Playground. No API calls — pure static UI.

### Route

`app/page.tsx`

### Sections (from original plan + design)

#### 1. Sticky Navbar

- TokenSense logo (wordmark)
- Nav links: Home, Docs, Playground, Dashboard
- CTA button: "GET API KEY"
- Links navigate to their respective routes

#### 2. Hero Section

- Eyebrow pill: "[ AI_ORCHESTRATION_ENGINE ]"
- H1: "Smarter Context. Better Answers. Lower Costs."
- Subtext: "Smarter context. 72% fewer tokens. Same quality."
- Two CTAs: "LAUNCH PLAYGROUND →" (links to `/playground`) + "READ DOCS" (links to `/docs`)
- Trust line: "v1.0.0 | OpenRouter · Gemini · Actian VectorAI"

#### 3. Stats Ticker Bar

- Three stats in a row: `TOKENS_PROCESSED: 2,847,192` | `AVG_REDUCTION: 72.3%` | `REQUESTS_TODAY: 1,429`
- These are static display values for the landing page

#### 4. "How It Works" / Architecture Section

The design expanded this from the original 3-step cards into a full architecture breakdown:

- Section header with "ARCHITECTURE" pill + "How TokenSense Works" title + subtitle
- **Agent Pipeline Flow Diagram** — shows all 5 agents in sequence with connectors:
  1. Query Agent — generates embeddings, classifies task
  2. Retrieval Agent — fetches top-k chunks from Actian VectorAI DB
  3. Context Optimizer — deduplicates, compresses, enforces token budget
  4. Routing Agent — selects model based on complexity score
  5. Telemetry Agent — logs tokens, cost, latency to SQLite

#### 5. Impact Section

Three impact cards showing key value metrics. Already designed in `design.pen`.

#### 6. Demo Section (NEW — in design, not in original plan)

- Title: "SEE IT IN ACTION"
- Subtitle: "Watch how TokenSense optimizes your LLM workflow in under 2 minutes"
- Video container placeholder with play icon
- Caption: "Complete walkthrough: installation → indexing → optimization → results"

**NEW — Feature needed:** Either embed an actual demo video or replace with an animated/interactive terminal demo showing the CLI flow (index → ask → result with token stats).

#### 7. Code Preview + Token Comparison (from original plan — NOT yet in design)

This section from the original plan is still relevant and should be built:

- Left side: dark terminal panel showing CLI command
  ```
  $ tokensense ask "explain the authentication flow"
  ✓ Indexed 142 chunks
  ✓ Context optimized: 8,200 → 2,100 tokens
  ✓ Model: claude-3-haiku (auto-selected)
  ```
- Right side: Before/After token count visualizer
  - "Before" badge: 8,200 tokens
  - Arrow
  - "After" badge: 2,100 tokens
  - "-74% savings" label

#### 8. Integration Logos Row (from original plan — NOT yet in design)

Still relevant — should be built:
- "Works with your stack" label
- Logo pills: OpenRouter, Gemini, Actian VectorAI, Python, FastAPI

#### 9. Footer (from original plan — NOT yet in design)

Still relevant — should be built:
- "TokenSense" wordmark left
- Links right: GitHub, Docs, Playground, API Reference
- Bottom bar: "Built for the Hackathon · MIT License"

---

## Page 2: Playground (`/playground`)

### Purpose

Interactive demo where developers query TokenSense and see real-time token optimization.

### Route

`app/playground/page.tsx`

### API Endpoints Used

- `POST /ask` — primary query flow
- `POST /optimize` — context-only preview (no LLM call, for showing optimization stats)

### Sections (from original plan + design)

#### 1. Navbar

- Same structure as landing page navbar with "PLAYGROUND" link highlighted as active

#### 2. Subbar / Page Header

- Title: "Playground"
- Right: API Key chip showing "API Key: ••••••••" + settings gear icon

#### 3. Two-Panel Layout (fixed viewport height, no page-level scroll)

**Left Panel — Query Input:**
- Panel header: "QUERY INPUT" label + live token counter ("0 tokens")
- Textarea with placeholder: "Enter a question, paste code, or describe a task..."
- Controls area at bottom:
  - Model dropdown: "Auto (Recommended)", "GPT-4o Mini", "Gemini Pro", "Claude 3 Haiku" — "Auto" lets the routing agent decide; selecting a specific model is display-only since the backend always auto-routes
  - Token Budget slider: range 1000–16000, default 8000, step 500, shows formatted value
  - Optimize Context toggle: default ON
  - Run button: "RUN QUERY →" — full width

**Right Panel — Response:**
- Panel header: "RESPONSE" label
- Metadata row: 4 mini-cards showing Tokens Used, Est. Cost, Model, Latency — all default to "—"
- Response output area: scrollable, shows answer text
- Context Optimization panel at bottom: Before/After token comparison + savings badge

### NEW — Features to Add

#### API Key Settings Modal

The settings gear icon in the subbar should open a modal allowing users to configure:
- **API URL** — text input, default `http://localhost:8000`
- **"Use Demo Server" toggle** — when ON, sets URL to `http://108.61.192.150:8000`
- **API Key** — password input
- Values persist in `localStorage` across sessions
- The API Key chip in the subbar updates to reflect whether a key is configured

#### Live Token Counter

The "0 tokens" counter in the left panel header should update in real time as the user types, using the formula: `Math.round(wordCount * 1.3)` (matching the backend's estimation logic).

#### Markdown Rendering in Response

The response output area should render the `answer` field as markdown (headings, code blocks, lists, bold/italic). Use `react-markdown` with syntax highlighting for code blocks.

#### Keyboard Shortcut

`Cmd/Ctrl + Enter` submits the query (same as clicking Run).

#### Disabled State for Run Button

The Run button should be disabled (visually dimmed, not clickable) when the textarea is empty.

#### States

| State | Behavior |
|-------|----------|
| **Idle** | Textarea empty or has text. Run button enabled if text present. Metadata cards show "—". |
| **Loading** | Run button shows spinner, text changes to "Running...". Response area shows blinking cursor or loading animation. Metadata cards show skeleton placeholders. |
| **Success** | All fields populated from `/ask` response. Answer rendered in output area. Metadata cards filled. Optimization panel shows before/after. |
| **Error** | Error message displayed in response area. Toast notification with the error detail from the API. Metadata cards reset to "—". |
| **No Indexed Data** | If the response answer is empty or generic because no chunks were indexed, show a callout: "No indexed data found. Index a codebase first to get context-aware answers." with a link to `/docs`. |

#### Model Display Name Mapping

The metadata "Model" card should show a readable name, not the raw model ID:
- `anthropic/claude-3-haiku` → "Claude 3 Haiku"
- `openai/gpt-4o-mini` → "GPT-4o Mini"
- `google/gemini-pro` → "Gemini Pro"

#### Cost Formatting

The "Est. Cost" metadata card should format `cost_usd` as `$0.001200` (6 decimal places).

#### Latency Formatting

The "Latency" metadata card should format `latency_ms` with comma separators, e.g. `1,032 ms`.

#### Context Optimization Panel Data Binding

- "Before" value: `input_tokens` from the response (original tokens before optimization)
- "After" value: `optimized_tokens` from the response
- Savings badge: `context_reduction_pct` from the response, formatted as "-{value}% saved"
- Panel only visible when the Optimize Context toggle is ON

---

## Page 3: Dashboard (`/dashboard`)

### Purpose

Analytics view of all TokenSense usage. All data comes from `GET /stats`.

### Route

`app/dashboard/page.tsx`

### API Endpoints Used

- `GET /stats?limit={n}` — returns `summary` + `recent_queries` array
- `GET /` — health check (optional, for backend status indicator)

### Sections (from original plan + design)

#### 1. Left Sidebar (240px)

Nav items with icons:
- Overview (active by default) → `/dashboard`
- Playground → `/playground`
- API Keys → placeholder (disabled style for now)
- Docs → `/docs`

User section at bottom with avatar + name.

#### 2. Top Bar

- "Analytics Overview" title
- Right side controls:
  - Limit selector dropdown (controls query param for `GET /stats`)
  - Refresh button (re-fetches data)

#### 3. Stats Row — 4 Cards

| Card | Data Source | Notes |
|------|------------|-------|
| Total Queries | `summary.total_queries` | Comma-formatted integer |
| Avg Token Reduction | `summary.avg_token_reduction_pct` | Formatted as `{value}%` |
| Total Cost Saved | `summary.total_cost_usd` | Formatted as `${value}` (4 decimal places) |
| Avg Latency | `summary.avg_latency_ms` | Formatted as `{value}ms` |

#### 4. Charts Row (line chart + model distribution)

**Left — "Queries Over Time" (Line/Area Chart):**
- Data: group `recent_queries` by date (from `timestamp` field), count per day
- X-axis: dates, Y-axis: query count
- Library: Recharts `<AreaChart>`

**Right — "Model Distribution":**
- Data: count occurrences of each `model_used` value in `recent_queries`
- Three segments for the three models (Claude Haiku, GPT-4o Mini, Gemini Pro)
- Legend below with model names and percentages

#### 5. Token Savings Bar Chart (from original plan — NOT yet in design)

This section from the original plan is still relevant and should be built:

- "Token Savings Per Query" — grouped bar chart
- Last 10 entries from `recent_queries`
- Two bars per group: `input_tokens` (original) vs `optimized_tokens` (optimized)
- X-axis: truncated query snippet or index
- Library: Recharts `<BarChart>` with two `<Bar>` components

#### 6. Recent Queries Table

Columns (matching the design):

| Column | Data Field | Format |
|--------|-----------|--------|
| Timestamp | `timestamp` | Short datetime or relative ("2m ago") |
| Query | `query_snippet` | First 40 chars, truncated |
| Model | `model_used` | Display name (see mapping above) |
| Input Tokens | `input_tokens` | Comma-formatted |
| Output Tokens | `output_tokens` | Comma-formatted |
| Optimized | `optimized_tokens` | Comma-formatted |
| Cost | `cost_usd` | `$0.001200` |
| Latency | `latency_ms` | `{value} ms` |

- Alternating row shading
- "View All →" link toggles between showing 5 rows and all rows
- Sortable column headers (click to toggle asc/desc)

### NEW — Features to Add

#### Backend Status Indicator

Add a small status dot next to the Refresh button:
- Green if `GET /` returns 200
- Red if it fails
- Checked on mount

#### Empty State

When `summary.total_queries === 0`:
- Stats cards show "0" / "0%" / "$0.00" / "0ms"
- Charts show a centered message: "No data yet — run some queries in the Playground to see analytics here."
- Table shows: "No queries recorded yet."

#### Loading State

While `GET /stats` is in flight:
- Stats cards show skeleton/shimmer placeholders
- Charts show empty containers with subtle loading animation
- Table shows 3–5 skeleton rows

#### Error State

If `GET /stats` fails:
- Toast notification with the error detail
- Stats cards show "—"
- Charts and table show an error message

#### Auto-Refresh (Optional)

Poll `GET /stats` every 30 seconds while the page is visible (use `document.visibilityState`). Show a subtle "Updated just now" timestamp near the Refresh button.

---

## Page 4: Docs (`/docs`)

### Purpose

Developer reference documentation. Three-column layout. Content is statically defined in the frontend (no CMS).

### Route

`app/docs/page.tsx` — renders Quick Start by default. Can extend to `app/docs/[slug]/page.tsx` later, but for v1 a single page with section switching is sufficient.

### Sections (from original plan + design)

#### 1. Navbar

Same structure as landing page with "DOCS" in top bar.

#### 2. Three-Column Layout

**Left Sidebar (260px):**
- "TokenSense" logo
- Search bar: "search docs..." — client-side filtering of nav items by title
- Nav sections (all present in the design):

| Section | Items |
|---------|-------|
| GETTING STARTED | Installation, Quick Start (active by default), Authentication |
| API REFERENCE | POST /ask, POST /index, POST /optimize, GET /stats |
| CLI COMMANDS | tokensense init, tokensense index, tokensense ask, tokensense stats |
| AGENTS | Query Agent, Retrieval Agent, Context Optimizer, Routing Agent |
| INTEGRATIONS | OpenRouter API, Gemini API, Actian VectorAI |

- Collapsed/expanded toggle per section
- Active item has accent left border

**Center Content (flexible):**
- Breadcrumb: "Docs › Getting Started › Quick Start"
- Page title
- Meta line: "5 min read · Updated Feb 2026"
- Step-by-step content with numbered badges
- Code blocks with copy button
- Previous/Next navigation at bottom

**Right TOC Sidebar (200px):**
- "ON THIS PAGE" label
- Anchor links that highlight based on scroll position (Intersection Observer)
- Currently shows: Installation, Set API Key, Index Repository, Your First Query, Environment Variables, API Endpoints

#### 3. Default Content — "Quick Start" Page

**Step 1 — Install TokenSense**
```bash
pip install tokensense
```

**Step 2 — Set Your API Key**
```bash
tokensense init
# Or connect to the hosted demo:
tokensense init --demo
```

**Step 3 — Index Your Repository**
```bash
tokensense index ./my-project
```

**Step 4 — Run Your First Query**
```bash
tokensense ask "how does the authentication flow work?"
```

**Environment Variables section** (already in design):
Lists `TOKENSENSE_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `ACTIAN_HOST`, `ACTIAN_PORT`

**API Endpoints section** (already in design):
Summary of `POST /index`, `POST /ask`, `POST /optimize`, `GET /stats` — all require `X-API-Key` header

### NEW — Features to Add

#### Telemetry Agent in Agents Section

The left sidebar's AGENTS section currently lists 4 agents. It should also include:
- **Telemetry Agent** — logs tokens, cost, latency to SQLite

This matches the actual backend which has 5 agents (`query_agent.py`, `retrieval_agent.py`, `context_optimizer.py`, `routing_agent.py`, `telemetry_agent.py`).

#### Full Content Inventory

Each nav item should have a corresponding content page. Define all content statically in a `docs-content.ts` (or similar) data structure:

| Nav Item | Key Content to Include |
|----------|----------------------|
| **Installation** | Prerequisites (Python 3.11+, Docker), `pip install tokensense`, venv setup, clone backend repo |
| **Quick Start** | The 4 steps + env vars + API endpoints (already in design) |
| **Authentication** | `X-API-Key` header, `TOKENSENSE_API_KEY` env var, 401 error behavior |
| **POST /ask** | Request/response schema (see API Contract above), `token_budget` param, model auto-routing |
| **POST /index** | Request/response schema, `file_extensions` param, chunking behavior (~500 tokens per chunk) |
| **POST /optimize** | Request/response schema, explain this skips the LLM call — context preview only |
| **GET /stats** | Response schema, `limit` query param (1–1000), `summary` vs `recent_queries` |
| **tokensense init** | Config saved to `~/.tokensense/config`, `--demo` flag sets URL to hosted server |
| **tokensense index** | `<path>` argument, `--ext` flag for file extensions |
| **tokensense ask** | `"<query>"` argument, `--budget` flag for token budget |
| **tokensense stats** | `--limit` flag, summary panel + recent queries table output |
| **Query Agent** | Generates embeddings via OpenRouter (`text-embedding-ada-002`), classifies task as code/documentation/general |
| **Retrieval Agent** | Fetches top-k chunks from Actian VectorAI DB via gRPC, batch store/upsert support |
| **Context Optimizer** | Deduplicates (>80% word overlap), re-ranks by score, truncates to token budget |
| **Routing Agent** | Model selection logic (see routing table above), calls OpenRouter or Gemini API |
| **Telemetry Agent** | Calculates cost per model, persists to SQLite, per-1k-token pricing |
| **OpenRouter API** | Used for embeddings + chat completions, multi-model abstraction |
| **Gemini API** | Fallback for code/large-context queries, called via REST |
| **Actian VectorAI** | Vector database running via Docker on port 50051, gRPC client, cosine distance |

#### Section Switching Behavior

When a user clicks a nav item in the left sidebar:
- The center content updates to show that page's content
- The breadcrumb updates to reflect the new location
- The right TOC updates with the new page's headings
- The URL hash or query param updates (e.g. `/docs?section=api-ask`) for shareability
- The "Previous/Next" bottom nav links update to the adjacent items

#### Search Functionality

The search bar in the left sidebar should:
- Filter nav items in real time as the user types
- Match against item titles (case-insensitive)
- Show/expand sections that contain matching items
- Clear button to reset the filter

#### Code Block Copy Button

All code blocks in the center content area should have a clipboard copy button that:
- Shows a copy icon in the top-right corner of the code block
- On click, copies the code content to clipboard
- Shows brief "Copied!" feedback

---

## Global Features (All Pages)

### Error Handling

All API calls should follow this pattern:
1. Show loading indicator while waiting
2. On HTTP 401 → show "Invalid API key" message and prompt user to check their key
3. On HTTP 4xx/5xx → show the `detail` field from the JSON error response
4. On network error → show "Could not connect to the API. Is the backend running?"

### Toast / Notification System

Use shadcn/ui `Sonner` or `Toast` for user-facing feedback:
- **Success** — "Indexed 142 files", "Query completed", etc.
- **Error** — API error detail or connection failure
- **Info** — informational messages

### Responsive Behavior

Minimum supported width: 768px.

- **Landing:** Below 1024px, card rows stack vertically. Below 768px, hero text shrinks, CTAs stack.
- **Playground:** Below 1024px, panels stack vertically (input on top, response below), page becomes scrollable.
- **Dashboard:** Below 1024px, sidebar collapses to icons-only. Below 768px, sidebar becomes bottom tab bar, stats row wraps to 2×2, charts stack.
- **Docs:** Below 1024px, right TOC hidden. Below 768px, left sidebar becomes slide-out drawer.

---

## Implementation Reference

### Project Setup

```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd frontend
npx shadcn@latest init
npx shadcn@latest add button card input label slider switch select table badge separator toast sonner
npm install recharts lucide-react react-markdown
```

### Typed API Client (`frontend/lib/api.ts`)

```typescript
type AskRequest = { query: string; token_budget?: number }
type AskResponse = {
  answer: string; model: string; input_tokens: number; output_tokens: number
  optimized_tokens: number; cost_usd: number; latency_ms: number; context_reduction_pct: number
}

type OptimizeRequest = { query: string; token_budget?: number }
type OptimizeResponse = {
  optimized_context: string; original_tokens: number
  optimized_tokens: number; reduction_pct: number; chunks_retrieved: number
}

type IndexRequest = { path: string; file_extensions?: string[] }
type IndexResponse = { indexed_files: number; chunks: number; status: string }

type StatsSummary = {
  total_queries: number; avg_token_reduction_pct: number
  total_cost_usd: number; avg_latency_ms: number
}
type QueryRecord = {
  id: number; timestamp: string; query_snippet: string; model_used: string
  input_tokens: number; output_tokens: number; optimized_tokens: number
  cost_usd: number; latency_ms: number
}
type StatsResponse = { summary: StatsSummary; recent_queries: QueryRecord[] }

export async function ask(req: AskRequest): Promise<AskResponse>
export async function optimize(req: OptimizeRequest): Promise<OptimizeResponse>
export async function indexPath(req: IndexRequest): Promise<IndexResponse>
export async function getStats(limit?: number): Promise<StatsResponse>
export async function healthCheck(): Promise<{ status: string; service: string; version: string }>
```

The client should:
- Read `NEXT_PUBLIC_API_URL` from env (default `http://localhost:8000`)
- Support runtime override from `localStorage` (for the Playground API key modal)
- Send `X-API-Key` and `Content-Type: application/json` on every request
- Throw typed errors with the `detail` field from API error responses

### Model Display Name Helper

```typescript
const MODEL_DISPLAY: Record<string, string> = {
  "anthropic/claude-3-haiku": "Claude 3 Haiku",
  "openai/gpt-4o-mini": "GPT-4o Mini",
  "google/gemini-pro": "Gemini Pro",
}
export function displayModelName(model: string): string {
  return MODEL_DISPLAY[model] ?? model
}
```

### Environment Variables (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-tokensense-api-key
```

### Page Build Order

1. **Landing** (`app/page.tsx`) — no API calls, pure static UI
2. **Playground** (`app/playground/page.tsx`) — validates backend integration via `/ask`
3. **Dashboard** (`app/dashboard/page.tsx`) — needs telemetry data from `/stats`
4. **Docs** (`app/docs/page.tsx`) — static content, can be built any time

---

## Build Checklist

```
[ ] Next.js 14 initialized with TypeScript + Tailwind + App Router
[ ] shadcn/ui initialized, all needed components added
[ ] recharts + lucide-react + react-markdown installed
[ ] Design tokens from design.pen configured in Tailwind config
[ ] frontend/lib/api.ts — typed client with all 5 functions
[ ] frontend/.env.local configured
[ ] Toast/notification system wired up (Sonner)
[ ] Model display name helper utility

Landing Page:
[ ] Navbar with working route links
[ ] Hero section with CTAs linking to /playground and /docs
[ ] Stats ticker bar
[ ] Architecture / How It Works section with 5-agent pipeline
[ ] Impact cards section
[ ] Demo section (video placeholder or interactive terminal)
[ ] Code Preview + Token Comparison split (from original plan)
[ ] Integration logos row (from original plan)
[ ] Footer (from original plan)

Playground:
[ ] Navbar with Playground active
[ ] Subbar with API Key chip + settings icon
[ ] API Key settings modal (URL + key, localStorage, demo toggle)
[ ] Left panel: textarea + live token counter + controls + Run button
[ ] Right panel: metadata cards + response output + context optimization panel
[ ] POST /ask integration with all state handling (idle, loading, success, error, no-data)
[ ] Markdown rendering in response area
[ ] Cmd/Ctrl+Enter keyboard shortcut
[ ] Run button disabled when textarea empty

Dashboard:
[ ] Sidebar with working nav links + active state
[ ] Top bar with limit selector + refresh button + backend status dot
[ ] Stats row — 4 cards bound to summary data
[ ] Line/area chart — queries over time (grouped by day from recent_queries)
[ ] Model distribution chart (count model_used occurrences)
[ ] Token savings bar chart (input_tokens vs optimized_tokens, last 10 queries)
[ ] Recent queries table with sorting + "View All" toggle
[ ] GET /stats integration with loading, empty, and error states
[ ] Auto-refresh every 30s (optional)

Docs:
[ ] Navbar + top bar
[ ] Left sidebar: search bar + all 5 nav sections with expand/collapse
[ ] Telemetry Agent added to Agents section
[ ] Center content: Quick Start with 4 steps + env vars + API endpoints
[ ] Right TOC: scroll-tracked anchor links
[ ] Section switching when clicking sidebar items
[ ] All content pages written (see Full Content Inventory)
[ ] Code block copy button
[ ] Previous/Next bottom navigation
[ ] Search filtering in sidebar

Cross-cutting:
[ ] Error handling on all API calls (401, 4xx/5xx, network error)
[ ] Responsive behavior at 1024px and 768px breakpoints
[ ] CORS verified: frontend ↔ backend
```
