// ── Docs content data structure ───────────────────────────────

export type DocSection = {
  id: string
  label: string
  breadcrumb: string
  title: string
  meta: string
  tocItems: { id: string; label: string }[]
  content: DocBlock[]
}

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; variant: "info" | "warn"; text: string }
  | { type: "step"; num: number; title: string; desc?: string }

// ── Navigation structure ─────────────────────────────────────

export const DOC_NAV = [
  {
    section: "GETTING STARTED",
    items: [
      { id: "installation", label: "Installation" },
      { id: "quick-start", label: "Quick Start" },
      { id: "authentication", label: "Authentication" },
    ],
  },
  {
    section: "API REFERENCE",
    items: [
      { id: "api-ask", label: "POST /ask" },
      { id: "api-index", label: "POST /index" },
      { id: "api-optimize", label: "POST /optimize" },
      { id: "api-stats", label: "GET /stats" },
    ],
  },
  {
    section: "CLI COMMANDS",
    items: [
      { id: "cli-init", label: "tokensense init" },
      { id: "cli-index", label: "tokensense index" },
      { id: "cli-ask", label: "tokensense ask" },
      { id: "cli-stats", label: "tokensense stats" },
    ],
  },
  {
    section: "AGENTS",
    items: [
      { id: "agent-query", label: "Query Agent" },
      { id: "agent-retrieval", label: "Retrieval Agent" },
      { id: "agent-optimizer", label: "Context Optimizer" },
      { id: "agent-routing", label: "Routing Agent" },
      { id: "agent-telemetry", label: "Telemetry Agent" },
    ],
  },
  {
    section: "INTEGRATIONS",
    items: [
      { id: "int-openrouter", label: "OpenRouter API" },
      { id: "int-gemini", label: "Gemini API" },
      { id: "int-actian", label: "Actian VectorAI" },
    ],
  },
]

// Flat list for prev/next navigation
export const ALL_SECTIONS = DOC_NAV.flatMap((g) => g.items)

// ── Content pages ─────────────────────────────────────────────

export const DOC_CONTENT: Record<string, DocSection> = {

  "quick-start": {
    id: "quick-start",
    label: "Quick Start",
    breadcrumb: "Docs › Getting Started › Quick Start",
    title: "Quick Start Guide",
    meta: "5 min read · Updated Feb 2026",
    tocItems: [
      { id: "install", label: "Install TokenSense" },
      { id: "set-key", label: "Set API Key" },
      { id: "index-repo", label: "Index Repository" },
      { id: "first-query", label: "Your First Query" },
      { id: "env-vars", label: "Environment Variables" },
      { id: "endpoints", label: "API Endpoints" },
    ],
    content: [
      { type: "step", num: 1, title: "Install TokenSense", desc: "Install from PyPI using pip." },
      { type: "code", lang: "bash", code: "pip install tokensense" },
      { type: "step", num: 2, title: "Set Your API Key", desc: "Initialize the CLI config." },
      { type: "code", lang: "bash", code: `tokensense init\n# Or connect to the hosted demo:\ntokensense init --demo` },
      { type: "step", num: 3, title: "Index Your Repository", desc: "Embed files into the vector database." },
      { type: "code", lang: "bash", code: "tokensense index ./my-project" },
      { type: "step", num: 4, title: "Run Your First Query" },
      { type: "code", lang: "bash", code: `tokensense ask "how does the authentication flow work?"` },
      { type: "h2", text: "Environment Variables", id: "env-vars" },
      { type: "table",
        headers: ["Variable", "Description"],
        rows: [
          ["TOKENSENSE_API_KEY", "Your backend API key"],
          ["OPENROUTER_API_KEY", "OpenRouter key for embeddings + LLMs"],
          ["GEMINI_API_KEY", "Google Gemini key for fallback"],
          ["ACTIAN_HOST", "Vector DB host (default: localhost)"],
          ["ACTIAN_PORT", "Vector DB gRPC port (default: 50051)"],
        ],
      },
      { type: "h2", text: "API Endpoints", id: "endpoints" },
      { type: "table",
        headers: ["Method", "Path", "Description"],
        rows: [
          ["POST", "/index", "Embed and index files"],
          ["POST", "/ask", "Full optimization pipeline"],
          ["POST", "/optimize", "Context preview (no LLM)"],
          ["GET", "/stats", "Usage analytics"],
        ],
      },
    ],
  },

  "installation": {
    id: "installation",
    label: "Installation",
    breadcrumb: "Docs › Getting Started › Installation",
    title: "Installation",
    meta: "3 min read",
    tocItems: [
      { id: "prereqs", label: "Prerequisites" },
      { id: "pypi", label: "Install from PyPI" },
      { id: "backend", label: "Backend Setup" },
      { id: "verify", label: "Verify Installation" },
    ],
    content: [
      { type: "h2", text: "Prerequisites", id: "prereqs" },
      { type: "table",
        headers: ["Requirement", "Version"],
        rows: [
          ["Python", "3.11+"],
          ["Docker", "Latest (for Actian VectorAI)"],
          ["pip", "Any recent version"],
        ],
      },
      { type: "h2", text: "Option A — Install from PyPI (Recommended)", id: "pypi" },
      { type: "code", lang: "bash", code: "pip install tokensense" },
      { type: "h2", text: "Option B — Install from Source", id: "source" },
      { type: "code", lang: "bash", code: `git clone https://github.com/yourusername/TokenSense.git\ncd TokenSense\npip install -e .` },
      { type: "h2", text: "Backend Setup", id: "backend" },
      { type: "code", lang: "bash", code: `# Start Actian VectorAI DB\ndocker run -d -p 50051:50051 actian/vectorai-db\n\n# Copy env template\ncp .env.example .env\n# Edit .env with your API keys\n\n# Start backend\ncd backend\npip install -r requirements.txt\nuvicorn main:app --reload --port 8000` },
      { type: "h2", text: "Verify Installation", id: "verify" },
      { type: "code", lang: "bash", code: "tokensense --version\n# tokensense v0.1.1" },
    ],
  },

  "authentication": {
    id: "authentication",
    label: "Authentication",
    breadcrumb: "Docs › Getting Started › Authentication",
    title: "Authentication",
    meta: "2 min read",
    tocItems: [
      { id: "api-key", label: "API Key" },
      { id: "header", label: "X-API-Key Header" },
      { id: "errors", label: "Error Handling" },
    ],
    content: [
      { type: "p", text: "All API requests require an API key passed via the X-API-Key header." },
      { type: "h2", text: "API Key", id: "api-key" },
      { type: "code", lang: "bash", code: "# .env\nTOKENSENSE_API_KEY=your-secret-api-key\n\n# CLI\ntokensense init\n# Enter API URL: http://localhost:8000\n# Enter API key: your-key" },
      { type: "h2", text: "X-API-Key Header", id: "header" },
      { type: "code", lang: "bash", code: `curl -X POST http://localhost:8000/ask \\\n  -H "X-API-Key: your-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"query": "explain the auth flow"}'` },
      { type: "h2", text: "Error Handling", id: "errors" },
      { type: "table",
        headers: ["Status", "Meaning", "Fix"],
        rows: [
          ["401", "Invalid or missing API key", "Check TOKENSENSE_API_KEY in .env"],
          ["403", "Key does not have access", "Regenerate API key"],
          ["422", "Invalid request body", "Check request schema"],
        ],
      },
    ],
  },

  "api-ask": {
    id: "api-ask",
    label: "POST /ask",
    breadcrumb: "Docs › API Reference › POST /ask",
    title: "POST /ask",
    meta: "Full pipeline query",
    tocItems: [
      { id: "request", label: "Request Body" },
      { id: "response", label: "Response" },
      { id: "routing", label: "Model Routing" },
      { id: "example", label: "Example" },
    ],
    content: [
      { type: "p", text: "Runs the full optimization pipeline: retrieval → compression → routing → LLM call. Returns the answer with full telemetry." },
      { type: "h2", text: "Request Body", id: "request" },
      { type: "code", lang: "json", code: `{\n  "query": "how does the auth flow work?",\n  "token_budget": 8000\n}` },
      { type: "table",
        headers: ["Field", "Type", "Required", "Default"],
        rows: [
          ["query", "string", "Yes", "—"],
          ["token_budget", "integer", "No", "8000"],
        ],
      },
      { type: "h2", text: "Response", id: "response" },
      { type: "code", lang: "json", code: `{\n  "answer": "string",\n  "model": "anthropic/claude-3-haiku",\n  "input_tokens": 2100,\n  "output_tokens": 107,\n  "optimized_tokens": 131,\n  "cost_usd": 0.0012,\n  "latency_ms": 1032,\n  "context_reduction_pct": 74.0\n}` },
      { type: "h2", text: "Model Routing Logic", id: "routing" },
      { type: "table",
        headers: ["Task Type", "Context Size", "Model"],
        rows: [
          ["General", "< 3,000 tokens", "Claude 3 Haiku"],
          ["Documentation", "3k – 6k tokens", "GPT-4o Mini"],
          ["Code / Large", "> 6,000 tokens", "Gemini Pro"],
        ],
      },
      { type: "h2", text: "Example", id: "example" },
      { type: "code", lang: "bash", code: `curl -X POST http://localhost:8000/ask \\\n  -H "X-API-Key: your-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"query": "explain the routing agent", "token_budget": 8000}'` },
    ],
  },

  "api-index": {
    id: "api-index",
    label: "POST /index",
    breadcrumb: "Docs › API Reference › POST /index",
    title: "POST /index",
    meta: "Index a directory into the vector database",
    tocItems: [
      { id: "request", label: "Request Body" },
      { id: "response", label: "Response" },
      { id: "chunking", label: "Chunking Behavior" },
    ],
    content: [
      { type: "p", text: "Indexes files in a directory into Actian VectorAI DB. Files are split into ~500 token chunks, embedded, and stored for retrieval." },
      { type: "h2", text: "Request Body", id: "request" },
      { type: "code", lang: "json", code: `{\n  "path": "/absolute/path/to/project",\n  "file_extensions": [".py", ".ts", ".md"]\n}` },
      { type: "h2", text: "Response", id: "response" },
      { type: "code", lang: "json", code: `{\n  "indexed_files": 142,\n  "chunks": 87,\n  "status": "ok"\n}` },
      { type: "h2", text: "Chunking Behavior", id: "chunking" },
      { type: "p", text: "Files are split into ~500 token chunks. Each chunk is embedded using OpenRouter (text-embedding-ada-002) and stored with metadata in Actian VectorAI." },
      { type: "code", lang: "bash", code: `curl -X POST http://localhost:8000/index \\\n  -H "X-API-Key: your-key" \\\n  -d '{"path": "/Users/me/my-project", "file_extensions": [".py", ".js"]}'` },
    ],
  },

  "api-optimize": {
    id: "api-optimize",
    label: "POST /optimize",
    breadcrumb: "Docs › API Reference › POST /optimize",
    title: "POST /optimize",
    meta: "Context optimization preview — no LLM call",
    tocItems: [
      { id: "request", label: "Request Body" },
      { id: "response", label: "Response" },
    ],
    content: [
      { type: "p", text: "Returns the optimized context WITHOUT calling an LLM. Use this to preview token savings before committing to a query." },
      { type: "callout", variant: "info", text: "This endpoint is free — it performs retrieval and compression only, skipping the LLM call." },
      { type: "h2", text: "Request Body", id: "request" },
      { type: "code", lang: "json", code: `{\n  "query": "describe the routing agent",\n  "token_budget": 8000\n}` },
      { type: "h2", text: "Response", id: "response" },
      { type: "code", lang: "json", code: `{\n  "optimized_context": "...(compressed text)...",\n  "original_tokens": 8200,\n  "optimized_tokens": 2100,\n  "reduction_pct": 74.39,\n  "chunks_retrieved": 5\n}` },
    ],
  },

  "api-stats": {
    id: "api-stats",
    label: "GET /stats",
    breadcrumb: "Docs › API Reference › GET /stats",
    title: "GET /stats",
    meta: "Usage analytics",
    tocItems: [
      { id: "params", label: "Query Parameters" },
      { id: "response", label: "Response" },
    ],
    content: [
      { type: "p", text: "Returns usage analytics including a summary and per-query telemetry." },
      { type: "h2", text: "Query Parameters", id: "params" },
      { type: "table",
        headers: ["Param", "Type", "Default", "Max"],
        rows: [["limit", "integer", "100", "1000"]],
      },
      { type: "h2", text: "Response", id: "response" },
      { type: "code", lang: "json", code: `{\n  "summary": {\n    "total_queries": 1284,\n    "avg_token_reduction_pct": 68.0,\n    "total_cost_usd": 0.0017,\n    "avg_latency_ms": 1631\n  },\n  "recent_queries": [\n    {\n      "id": 1,\n      "timestamp": "2026-02-21T18:30:00Z",\n      "query_snippet": "how does auth work?",\n      "model_used": "anthropic/claude-3-haiku",\n      "input_tokens": 2100,\n      "output_tokens": 107,\n      "optimized_tokens": 131,\n      "cost_usd": 0.0012,\n      "latency_ms": 1032\n    }\n  ]\n}` },
      { type: "code", lang: "bash", code: `curl http://localhost:8000/stats?limit=20 \\\n  -H "X-API-Key: your-key"` },
    ],
  },

  "cli-init": {
    id: "cli-init",
    label: "tokensense init",
    breadcrumb: "Docs › CLI Commands › tokensense init",
    title: "tokensense init",
    meta: "Configure the CLI",
    tocItems: [{ id: "usage", label: "Usage" }, { id: "flags", label: "Flags" }],
    content: [
      { type: "p", text: "Initialize TokenSense CLI configuration. Saves API URL and key to ~/.tokensense/config." },
      { type: "h2", text: "Usage", id: "usage" },
      { type: "code", lang: "bash", code: `tokensense init\n# Or connect to the hosted demo:\ntokensense init --demo` },
      { type: "h2", text: "Flags", id: "flags" },
      { type: "table",
        headers: ["Flag", "Description"],
        rows: [["--demo", "Connect to hosted demo at http://108.61.192.150:8000"]],
      },
      { type: "code", lang: "bash", code: `$ tokensense init\nAPI URL [http://localhost:8000]: \nAPI Key: ••••••••\n✓ Configuration saved to ~/.tokensense/config` },
    ],
  },

  "cli-index": {
    id: "cli-index",
    label: "tokensense index",
    breadcrumb: "Docs › CLI Commands › tokensense index",
    title: "tokensense index",
    meta: "Index a directory",
    tocItems: [{ id: "usage", label: "Usage" }, { id: "flags", label: "Flags" }],
    content: [
      { type: "p", text: "Index a directory into the vector database for semantic retrieval." },
      { type: "h2", text: "Usage", id: "usage" },
      { type: "code", lang: "bash", code: `tokensense index <path>\ntokensense index ./my-project --ext .py --ext .ts` },
      { type: "h2", text: "Flags", id: "flags" },
      { type: "table",
        headers: ["Flag", "Description"],
        rows: [["--ext", "File extension to include (can be used multiple times)"]],
      },
      { type: "code", lang: "bash", code: `$ tokensense index ./my-project\nScanning directory...\nFound 142 files (.py, .ts, .md)\nIndexing... ████████████████████ 100%\n✓ Indexed 142 files, 87 chunks` },
    ],
  },

  "cli-ask": {
    id: "cli-ask",
    label: "tokensense ask",
    breadcrumb: "Docs › CLI Commands › tokensense ask",
    title: "tokensense ask",
    meta: "Query the pipeline",
    tocItems: [{ id: "usage", label: "Usage" }, { id: "flags", label: "Flags" }],
    content: [
      { type: "p", text: "Send a query through the full optimization pipeline and print the response." },
      { type: "h2", text: "Usage", id: "usage" },
      { type: "code", lang: "bash", code: `tokensense ask "<query>"\ntokensense ask "how does auth work?" --budget 4000` },
      { type: "h2", text: "Flags", id: "flags" },
      { type: "table",
        headers: ["Flag", "Description", "Default"],
        rows: [["--budget", "Token budget for context optimization", "8000"]],
      },
    ],
  },

  "cli-stats": {
    id: "cli-stats",
    label: "tokensense stats",
    breadcrumb: "Docs › CLI Commands › tokensense stats",
    title: "tokensense stats",
    meta: "View usage analytics",
    tocItems: [{ id: "usage", label: "Usage" }, { id: "output", label: "Output" }],
    content: [
      { type: "p", text: "View usage analytics and cost savings from the CLI." },
      { type: "h2", text: "Usage", id: "usage" },
      { type: "code", lang: "bash", code: `tokensense stats\ntokensense stats --limit 20` },
      { type: "h2", text: "Output", id: "output" },
      { type: "code", lang: "text", code: `┌─────────── Summary ────────────┐\n│ Total Queries:    1,284        │\n│ Avg Reduction:    68.0%        │\n│ Total Cost:       $0.0017      │\n│ Avg Latency:      1,631ms      │\n└────────────────────────────────┘` },
    ],
  },

  "agent-query": {
    id: "agent-query",
    label: "Query Agent",
    breadcrumb: "Docs › Agents › Query Agent",
    title: "Query Agent",
    meta: "Embeddings + task classification",
    tocItems: [{ id: "overview", label: "Overview" }, { id: "classification", label: "Task Classification" }],
    content: [
      { type: "p", text: "The Query Agent is the first stage in the pipeline. It converts the user's query into a vector embedding and classifies the task type." },
      { type: "h2", text: "Overview", id: "overview" },
      { type: "table",
        headers: ["Property", "Value"],
        rows: [
          ["Embedding model", "openai/text-embedding-ada-002 (via OpenRouter)"],
          ["Caching", "functools.lru_cache on embeddings"],
          ["Output", "1536-dimensional vector + task classification"],
        ],
      },
      { type: "h2", text: "Task Classification", id: "classification" },
      { type: "table",
        headers: ["Task Type", "Trigger Condition"],
        rows: [
          ["code", "Query mentions functions, classes, bugs, implementation"],
          ["documentation", "Query asks about how-to, setup, configuration, docs"],
          ["general", "All other queries"],
        ],
      },
    ],
  },

  "agent-retrieval": {
    id: "agent-retrieval",
    label: "Retrieval Agent",
    breadcrumb: "Docs › Agents › Retrieval Agent",
    title: "Retrieval Agent",
    meta: "Semantic search over indexed codebase",
    tocItems: [{ id: "overview", label: "Overview" }],
    content: [
      { type: "p", text: "The Retrieval Agent searches Actian VectorAI DB for the top-k most semantically relevant chunks using cosine similarity." },
      { type: "table",
        headers: ["Property", "Value"],
        rows: [
          ["Database", "Actian VectorAI DB (gRPC on port 50051)"],
          ["Similarity metric", "Cosine distance"],
          ["Default top-k", "10 chunks"],
        ],
      },
    ],
  },

  "agent-optimizer": {
    id: "agent-optimizer",
    label: "Context Optimizer",
    breadcrumb: "Docs › Agents › Context Optimizer",
    title: "Context Optimizer",
    meta: "Deduplication + compression",
    tocItems: [{ id: "overview", label: "Overview" }, { id: "algorithm", label: "Algorithm" }],
    content: [
      { type: "p", text: "The Context Optimizer reduces the retrieved chunks to fit within the token budget while preserving relevance." },
      { type: "h2", text: "Algorithm", id: "algorithm" },
      { type: "table",
        headers: ["Step", "Action"],
        rows: [
          ["1", "Remove duplicates with >80% word overlap"],
          ["2", "Re-rank remaining chunks by relevance score"],
          ["3", "Truncate from the bottom until within token budget"],
        ],
      },
    ],
  },

  "agent-routing": {
    id: "agent-routing",
    label: "Routing Agent",
    breadcrumb: "Docs › Agents › Routing Agent",
    title: "Routing Agent",
    meta: "Intelligent model selection",
    tocItems: [{ id: "routing", label: "Routing Table" }],
    content: [
      { type: "p", text: "The Routing Agent selects the optimal LLM based on task type and optimized context size." },
      { type: "h2", text: "Routing Table", id: "routing" },
      { type: "table",
        headers: ["Task Type", "Context Size", "Model", "Why"],
        rows: [
          ["General", "< 3,000 tokens", "Claude 3 Haiku", "Fastest and cheapest"],
          ["Documentation", "3k – 6k tokens", "GPT-4o Mini", "Balanced performance"],
          ["Code / Large", "> 6,000 tokens", "Gemini Pro", "Best for deep reasoning"],
        ],
      },
    ],
  },

  "agent-telemetry": {
    id: "agent-telemetry",
    label: "Telemetry Agent",
    breadcrumb: "Docs › Agents › Telemetry Agent",
    title: "Telemetry Agent",
    meta: "Cost calculation + SQLite persistence",
    tocItems: [
      { id: "overview", label: "Overview" },
      { id: "pricing", label: "Pricing Table" },
      { id: "schema", label: "Database Schema" },
    ],
    content: [
      { type: "p", text: "The Telemetry Agent calculates per-query cost and persists metrics to SQLite, powering the Dashboard analytics." },
      { type: "h2", text: "Pricing Table", id: "pricing" },
      { type: "table",
        headers: ["Model", "Input (per 1M tokens)", "Output (per 1M tokens)"],
        rows: [
          ["Claude 3 Haiku", "$0.25", "$1.25"],
          ["GPT-4o Mini", "$0.15", "$0.60"],
          ["Gemini Pro", "$0.50", "$1.50"],
        ],
      },
      { type: "h2", text: "Database Schema", id: "schema" },
      { type: "code", lang: "sql", code: `CREATE TABLE queries (\n  id INTEGER PRIMARY KEY,\n  timestamp TEXT,\n  query_snippet TEXT,\n  model_used TEXT,\n  input_tokens INTEGER,\n  output_tokens INTEGER,\n  optimized_tokens INTEGER,\n  cost_usd REAL,\n  latency_ms INTEGER\n);` },
    ],
  },

  "int-openrouter": {
    id: "int-openrouter",
    label: "OpenRouter API",
    breadcrumb: "Docs › Integrations › OpenRouter API",
    title: "OpenRouter API",
    meta: "Multi-model abstraction layer",
    tocItems: [{ id: "usage", label: "Usage" }],
    content: [
      { type: "p", text: "OpenRouter is used for both embeddings (text-embedding-ada-002) and chat completions (Claude 3 Haiku, GPT-4o Mini)." },
      { type: "code", lang: "bash", code: "OPENROUTER_API_KEY=sk-or-..." },
      { type: "table",
        headers: ["Usage", "Model"],
        rows: [
          ["Embeddings", "openai/text-embedding-ada-002"],
          ["Routing (small)", "anthropic/claude-3-haiku"],
          ["Routing (medium)", "openai/gpt-4o-mini"],
        ],
      },
    ],
  },

  "int-gemini": {
    id: "int-gemini",
    label: "Gemini API",
    breadcrumb: "Docs › Integrations › Gemini API",
    title: "Gemini API",
    meta: "Advanced reasoning fallback",
    tocItems: [{ id: "usage", label: "Usage" }],
    content: [
      { type: "p", text: "Google Gemini Pro is used as the fallback model for code queries and large context (>6,000 tokens)." },
      { type: "code", lang: "bash", code: "GEMINI_API_KEY=AIza..." },
    ],
  },

  "int-actian": {
    id: "int-actian",
    label: "Actian VectorAI",
    breadcrumb: "Docs › Integrations › Actian VectorAI",
    title: "Actian VectorAI DB",
    meta: "Vector database for semantic retrieval",
    tocItems: [{ id: "setup", label: "Docker Setup" }, { id: "client", label: "Python Client" }],
    content: [
      { type: "p", text: "Actian VectorAI DB is a high-performance vector database running as a Docker container, accessed via gRPC on port 50051." },
      { type: "h2", text: "Docker Setup", id: "setup" },
      { type: "code", lang: "bash", code: "docker run -d -p 50051:50051 actian/vectorai-db" },
      { type: "h2", text: "Python Client", id: "client" },
      { type: "code", lang: "bash", code: `# Download from:\n# https://github.com/hackmamba-io/actian-vectorAI-db-beta\npip install actiancortex-0.1.0b1-py3-none-any.whl` },
      { type: "table",
        headers: ["Property", "Value"],
        rows: [
          ["Protocol", "gRPC"],
          ["Port", "50051"],
          ["Auth", "None required"],
          ["Similarity", "Cosine distance"],
        ],
      },
    ],
  },
}
