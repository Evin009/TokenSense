import type {
  AskRequest, AskResponse,
  OptimizeRequest, OptimizeResponse,
  IndexRequest, IndexResponse,
  StatsResponse, HealthResponse, KeyResponse,
} from "./types"

const DEMO_URL = "http://localhost:8000" // Changed to localhost for local dev

function getConfig(): { url: string; key: string } {
  if (typeof window !== "undefined") {
    const url =
      localStorage.getItem("ts_api_url") ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000"
    const key =
      localStorage.getItem("ts_api_key") ||
      process.env.NEXT_PUBLIC_API_KEY ||
      ""
    return { url, key }
  }
  return {
    url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    key: process.env.NEXT_PUBLIC_API_KEY || "",
  }
}

export function saveSettings(url: string, key: string) {
  localStorage.setItem("ts_api_url", url)
  localStorage.setItem("ts_api_key", key)
}

export function loadSettings() {
  if (typeof window === "undefined") return { url: "", key: "", useDemo: false }
  const url = localStorage.getItem("ts_api_url") || ""
  const key = localStorage.getItem("ts_api_key") || ""
  return { url, key, useDemo: url === DEMO_URL }
}

export function setDemoMode(on: boolean) {
  if (on) {
    localStorage.setItem("ts_api_url", DEMO_URL)
  } else {
    localStorage.setItem("ts_api_url", process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { url, key } = getConfig()
  let res: Response
  try {
    res = await fetch(`${url}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": key,
        ...options?.headers,
      },
    })
  } catch (e) {
    const msg = e instanceof TypeError && e.message === "Failed to fetch"
      ? `Cannot reach API at ${url}. Is the backend running? (Try: docker compose up backend)`
      : (e instanceof Error ? e.message : "Network error")
    throw new Error(msg)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  ask: (req: AskRequest) =>
    request<AskResponse>("/ask", { method: "POST", body: JSON.stringify(req) }),

  optimize: (req: OptimizeRequest) =>
    request<OptimizeResponse>("/optimize", { method: "POST", body: JSON.stringify(req) }),

  indexPath: (req: IndexRequest) =>
    request<IndexResponse>("/index", { method: "POST", body: JSON.stringify(req) }),

  getStats: (limit = 100) =>
    request<StatsResponse>(`/stats?limit=${limit}`),

  healthCheck: () =>
    request<HealthResponse>("/"),

  generateKey: (label = "") =>
    fetch(`${DEMO_URL}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
        throw new Error(err.detail || "Failed to generate key")
      }
      return res.json() as Promise<KeyResponse>
    }),
}
