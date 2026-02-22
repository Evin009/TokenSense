// ── Request Types ────────────────────────────────────────────
export type AskRequest = {
  query: string
  token_budget?: number
}

export type OptimizeRequest = {
  query: string
  token_budget?: number
}

export type IndexRequest = {
  path: string
  file_extensions?: string[]
}

// ── Response Types ───────────────────────────────────────────
export type AskResponse = {
  answer: string
  model: string
  input_tokens: number
  output_tokens: number
  optimized_tokens: number
  cost_usd: number
  latency_ms: number
  context_reduction_pct: number
}

export type OptimizeResponse = {
  optimized_context: string
  original_tokens: number
  optimized_tokens: number
  reduction_pct: number
  chunks_retrieved: number
}

export type IndexResponse = {
  indexed_files: number
  chunks: number
  status: string
}

export type StatsSummary = {
  total_queries: number
  avg_token_reduction_pct: number
  total_cost_usd: number
  avg_latency_ms: number
}

export type QueryRecord = {
  id: number
  timestamp: string
  query_snippet: string
  model_used: string
  input_tokens: number
  output_tokens: number
  optimized_tokens: number
  cost_usd: number
  latency_ms: number
}

export type StatsResponse = {
  summary: StatsSummary
  recent_queries: QueryRecord[]
}

export type HealthResponse = {
  status: string
  service: string
  version: string
}

// ── UI State Types ───────────────────────────────────────────
export type PlaygroundState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: AskResponse }
  | { status: "error"; message: string }
  | { status: "no-data" }

export type ApiSettings = {
  url: string
  key: string
  useDemo: boolean
}
