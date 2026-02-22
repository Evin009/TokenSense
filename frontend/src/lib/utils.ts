import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Model display names ───────────────────────────────────────
const MODEL_NAMES: Record<string, string> = {
  "anthropic/claude-3-haiku": "Claude 3 Haiku",
  "openai/gpt-4o-mini": "GPT-4o Mini",
  "google/gemini-pro": "Gemini Pro",
}

export function displayModelName(model: string): string {
  return MODEL_NAMES[model] ?? model
}

// ── Formatters ────────────────────────────────────────────────
export function formatCost(usd: number): string {
  return `$${usd.toFixed(6)}`
}

export function formatLatency(ms: number): string {
  return `${ms.toLocaleString()} ms`
}

export function formatTokens(n: number): string {
  return n.toLocaleString()
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`
}

export function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.round(words * 1.3)
}

export function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function shortDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + "…" : str
}
