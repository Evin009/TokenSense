/**
 * Tests for src/lib/utils.ts — pure formatting and helper functions.
 * No mocking required; all functions are deterministic.
 */

import {
  cn,
  displayModelName,
  formatCost,
  formatLatency,
  formatTokens,
  formatPct,
  estimateTokens,
  timeAgo,
  shortDate,
  truncate,
} from "@/lib/utils"

// ── cn (class merge) ──────────────────────────────────────────────────────────

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("deduplicates conflicting tailwind classes", () => {
    // tailwind-merge should keep the last conflicting utility
    expect(cn("p-4", "p-8")).toBe("p-8")
  })

  it("handles falsy values", () => {
    expect(cn("foo", false && "bar", null, undefined, "baz")).toBe("foo baz")
  })
})

// ── displayModelName ──────────────────────────────────────────────────────────

describe("displayModelName", () => {
  it("maps known model IDs to display names", () => {
    expect(displayModelName("anthropic/claude-3-haiku")).toBe("Claude 3 Haiku")
    expect(displayModelName("openai/gpt-4o-mini")).toBe("GPT-4o Mini")
    expect(displayModelName("google/gemini-pro")).toBe("Gemini Pro")
  })

  it("returns the raw ID for unknown models", () => {
    expect(displayModelName("unknown/model-x")).toBe("unknown/model-x")
  })
})

// ── formatCost ────────────────────────────────────────────────────────────────

describe("formatCost", () => {
  it("formats cost with 6 decimal places", () => {
    expect(formatCost(0.000675)).toBe("$0.000675")
  })

  it("formats zero cost correctly", () => {
    expect(formatCost(0)).toBe("$0.000000")
  })

  it("always starts with $", () => {
    expect(formatCost(1.23)).toMatch(/^\$/)
  })
})

// ── formatLatency ─────────────────────────────────────────────────────────────

describe("formatLatency", () => {
  it("appends ' ms'", () => {
    expect(formatLatency(198)).toBe("198 ms")
  })

  it("adds thousands separator for large values", () => {
    expect(formatLatency(1500)).toBe("1,500 ms")
  })

  it("handles zero", () => {
    expect(formatLatency(0)).toBe("0 ms")
  })
})

// ── formatTokens ──────────────────────────────────────────────────────────────

describe("formatTokens", () => {
  it("formats tokens with locale separators", () => {
    expect(formatTokens(8200)).toBe("8,200")
  })

  it("handles small numbers", () => {
    expect(formatTokens(3)).toBe("3")
  })
})

// ── formatPct ─────────────────────────────────────────────────────────────────

describe("formatPct", () => {
  it("formats percentage with one decimal place", () => {
    expect(formatPct(72.3)).toBe("72.3%")
  })

  it("rounds to one decimal", () => {
    expect(formatPct(72.35)).toBe("72.4%")
  })

  it("handles zero", () => {
    expect(formatPct(0)).toBe("0.0%")
  })
})

// ── estimateTokens ────────────────────────────────────────────────────────────

describe("estimateTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0)
    expect(estimateTokens("   ")).toBe(0)
  })

  it("estimates using word count × 1.3", () => {
    // 10 words → round(10 * 1.3) = 13
    const text = Array(10).fill("word").join(" ")
    expect(estimateTokens(text)).toBe(13)
  })

  it("scales with text length", () => {
    const short = "hello world"
    const long = "hello world ".repeat(50)
    expect(estimateTokens(long)).toBeGreaterThan(estimateTokens(short))
  })
})

// ── timeAgo ───────────────────────────────────────────────────────────────────

describe("timeAgo", () => {
  it("returns 'just now' for very recent timestamps", () => {
    const recent = new Date(Date.now() - 30_000).toISOString()
    expect(timeAgo(recent)).toBe("just now")
  })

  it("returns minutes ago for timestamps < 1 hour", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString()
    expect(timeAgo(fiveMinutesAgo)).toBe("5m ago")
  })

  it("returns hours ago for timestamps < 24 hours", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000).toISOString()
    expect(timeAgo(twoHoursAgo)).toBe("2h ago")
  })

  it("returns days ago for older timestamps", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString()
    expect(timeAgo(threeDaysAgo)).toBe("3d ago")
  })
})

// ── shortDate ─────────────────────────────────────────────────────────────────

describe("shortDate", () => {
  it("returns a short month + day string", () => {
    const result = shortDate("2026-02-21T10:00:00Z")
    expect(result).toMatch(/^[A-Z][a-z]+ \d+$/) // e.g. "Feb 21"
  })
})

// ── truncate ──────────────────────────────────────────────────────────────────

describe("truncate", () => {
  it("returns the string unchanged when under max", () => {
    expect(truncate("short", 40)).toBe("short")
  })

  it("truncates and appends ellipsis when over max", () => {
    const long = "a".repeat(50)
    const result = truncate(long, 40)
    expect(result.length).toBe(41) // 40 + "…"
    expect(result.endsWith("…")).toBe(true)
  })

  it("uses default max of 40", () => {
    const long = "a".repeat(50)
    expect(truncate(long).length).toBe(41)
  })
})
