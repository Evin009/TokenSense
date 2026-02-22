/**
 * Tests for src/lib/api.ts — typed API client.
 * `fetch` is mocked globally; no real HTTP requests are made.
 */

// Mock localStorage in jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, "localStorage", { value: localStorageMock })

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockFetch(body: unknown, status = 200) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValueOnce(body),
  } as unknown as Response)
}

function mockFetchError(status: number, detail: string) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status,
    json: jest.fn().mockResolvedValueOnce({ detail }),
  } as unknown as Response)
}

beforeEach(() => {
  localStorageMock.clear()
  // Set up default API config
  localStorageMock.setItem("ts_api_url", "http://localhost:8000")
  localStorageMock.setItem("ts_api_key", "test-key-123")
})

// ── saveSettings / loadSettings ───────────────────────────────────────────────

describe("saveSettings / loadSettings", () => {
  it("persists and retrieves url and key", async () => {
    const { saveSettings, loadSettings } = await import("@/lib/api")
    saveSettings("http://my-server:8000", "my-key-xyz")
    const result = loadSettings()
    expect(result.url).toBe("http://my-server:8000")
    expect(result.key).toBe("my-key-xyz")
  })

  it("returns empty strings when nothing is stored", async () => {
    localStorageMock.clear()
    const { loadSettings } = await import("@/lib/api")
    const result = loadSettings()
    expect(result.url).toBe("")
    expect(result.key).toBe("")
  })
})

// ── api.healthCheck ───────────────────────────────────────────────────────────

describe("api.healthCheck", () => {
  it("calls GET / and returns the body", async () => {
    mockFetch({ status: "ok", service: "TokenSense", version: "0.1.0" })
    const { api } = await import("@/lib/api")
    const result = await api.healthCheck()
    expect(result.status).toBe("ok")
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/"),
      expect.objectContaining({ headers: expect.objectContaining({ "X-API-Key": expect.any(String) }) })
    )
  })
})

// ── api.ask ───────────────────────────────────────────────────────────────────

describe("api.ask", () => {
  it("posts to /ask and returns typed response", async () => {
    const mockResponse = {
      answer: "TokenSense reduces costs.",
      model: "anthropic/claude-3-haiku",
      input_tokens: 200,
      output_tokens: 60,
      optimized_tokens: 140,
      cost_usd: 0.0000825,
      latency_ms: 185,
      context_reduction_pct: 72.0,
    }
    mockFetch(mockResponse)
    const { api } = await import("@/lib/api")
    const result = await api.ask({ query: "what is tokensense?", token_budget: 8000 })

    expect(result.answer).toBe("TokenSense reduces costs.")
    expect(result.model).toBe("anthropic/claude-3-haiku")
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/ask"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("throws with the server detail message on error", async () => {
    mockFetchError(401, "Invalid API key")
    const { api } = await import("@/lib/api")
    await expect(api.ask({ query: "test" })).rejects.toThrow("Invalid API key")
  })

  it("sends the correct Content-Type and X-API-Key headers", async () => {
    mockFetch({ answer: "ok", model: "m", input_tokens: 0, output_tokens: 0,
                optimized_tokens: 0, cost_usd: 0, latency_ms: 0, context_reduction_pct: 0 })
    const { api } = await import("@/lib/api")
    await api.ask({ query: "test" })

    const [, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(init.headers["Content-Type"]).toBe("application/json")
    expect(init.headers["X-API-Key"]).toBeTruthy()
  })
})

// ── api.getStats ──────────────────────────────────────────────────────────────

describe("api.getStats", () => {
  it("calls GET /stats with the limit parameter", async () => {
    mockFetch({
      summary: { total_queries: 5, avg_token_reduction_pct: 70, total_cost_usd: 0.005, avg_latency_ms: 180 },
      recent_queries: [],
    })
    const { api } = await import("@/lib/api")
    await api.getStats(50)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/stats?limit=50"),
      expect.any(Object)
    )
  })

  it("defaults to limit=100", async () => {
    mockFetch({ summary: { total_queries: 0, avg_token_reduction_pct: 0, total_cost_usd: 0, avg_latency_ms: 0 }, recent_queries: [] })
    const { api } = await import("@/lib/api")
    await api.getStats()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("limit=100"),
      expect.any(Object)
    )
  })
})

// ── api.optimize ──────────────────────────────────────────────────────────────

describe("api.optimize", () => {
  it("posts to /optimize and returns response", async () => {
    const mockResponse = {
      optimized_context: "relevant context",
      original_tokens: 500,
      optimized_tokens: 140,
      reduction_pct: 72.0,
      chunks_retrieved: 3,
    }
    mockFetch(mockResponse)
    const { api } = await import("@/lib/api")
    const result = await api.optimize({ query: "explain routing agent" })

    expect(result.reduction_pct).toBe(72.0)
    expect(result.chunks_retrieved).toBe(3)
  })
})
