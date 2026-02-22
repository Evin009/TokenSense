"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { api } from "@/lib/api"
import {
  displayModelName,
  formatCost,
  formatLatency,
  formatTokens,
  formatPct,
  timeAgo,
  shortDate,
  truncate,
} from "@/lib/utils"
import type { StatsResponse, QueryRecord } from "@/lib/types"

// ── Icons ─────────────────────────────────────────────────────

function IconGrid({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function IconTerminal({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="14" height="12" rx="1.5" fill={color} fillOpacity="0.12" stroke={color} />
      <polyline points="4,6 7.5,8 4,10" />
      <line x1="9" y1="10" x2="12" y2="10" />
    </svg>
  )
}

function IconKey({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="8" r="3.5" fill={color} fillOpacity="0.15" />
      <line x1="8.5" y1="8" x2="15" y2="8" />
      <line x1="13" y1="6.5" x2="13" y2="8" />
      <line x1="15" y1="6.5" x2="15" y2="8" />
    </svg>
  )
}

function IconFile({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1.5h6.5l3 3V14.5H3V1.5z" fill={color} fillOpacity="0.12" />
      <polyline points="9.5,1.5 9.5,4.5 12.5,4.5" />
      <line x1="5" y1="7" x2="11" y2="7" />
      <line x1="5" y1="10" x2="11" y2="10" />
    </svg>
  )
}

function IconChevronLeft({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,3 5,7 9,11" />
    </svg>
  )
}

function IconChevronRight({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5,3 9,7 5,11" />
    </svg>
  )
}

// ── Section type ──────────────────────────────────────────────

type Section = "overview" | "api-keys"

// ── Sidebar ───────────────────────────────────────────────────

const SIDEBAR_NAV = [
  { label: "Overview", section: "overview" as Section, Icon: IconGrid },
  { label: "Playground", href: "/playground", Icon: IconTerminal },
  { label: "API Keys", section: "api-keys" as Section, Icon: IconKey },
  { label: "Docs", href: "/docs", Icon: IconFile },
]

function Sidebar({
  open,
  onToggle,
  activeSection,
  onSectionChange,
}: {
  open: boolean
  onToggle: () => void
  activeSection: Section
  onSectionChange: (s: Section) => void
}) {
  return (
    <aside
      className="flex flex-col h-full shrink-0 overflow-hidden"
      style={{
        width: open ? 240 : 60,
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        background: "#0D0D12",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo + toggle */}
      <div
        className="flex items-center justify-between px-4 pt-6 pb-2 shrink-0"
        style={{ minHeight: 56 }}
      >
        {open && (
          <span className="text-ts-accent font-mono text-sm font-bold tracking-wider whitespace-nowrap overflow-hidden">
            TokenSense
          </span>
        )}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-7 h-7 rounded transition-colors hover:bg-white/5 shrink-0"
          style={{ marginLeft: open ? 0 : "auto", marginRight: open ? 0 : "auto" }}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <IconChevronLeft color="#6B6B7B" /> : <IconChevronRight color="#6B6B7B" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 pt-6 flex-1">
        {SIDEBAR_NAV.map(({ label, section, href, Icon }) => {
          const isActive = section ? activeSection === section : false
          const iconColor = isActive ? "#00FF88" : "#6B6B7B"
          const commonClass = `flex items-center gap-3 h-10 rounded transition-colors ${
            isActive
              ? "text-ts-accent"
              : "text-ts-muted hover:text-ts-text hover:bg-white/[0.04]"
          }`
          const commonStyle = isActive
            ? {
                background: "rgba(0,255,136,0.08)",
                borderLeft: "2px solid #00FF88",
                paddingLeft: open ? 14 : 18,
                paddingRight: 12,
              }
            : { paddingLeft: open ? 12 : 20, paddingRight: 12 }

          if (section) {
            return (
              <button
                key={label}
                onClick={() => onSectionChange(section)}
                title={!open ? label : undefined}
                className={`w-full text-left ${commonClass}`}
                style={commonStyle}
              >
                <span className="shrink-0">
                  <Icon size={16} color={iconColor} />
                </span>
                {open && (
                  <span className="font-mono text-xs font-medium whitespace-nowrap overflow-hidden">
                    {label}
                  </span>
                )}
              </button>
            )
          }

          return (
            <Link
              key={label}
              href={href!}
              title={!open ? label : undefined}
              className={commonClass}
              style={commonStyle}
            >
              <span className="shrink-0">
                <Icon size={16} color={iconColor} />
              </span>
              {open && (
                <span className="font-mono text-xs font-medium whitespace-nowrap overflow-hidden">
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div
        className="flex items-center gap-3 px-3 py-4 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center font-mono text-xs font-bold shrink-0"
          style={{ background: "rgba(0,255,136,0.2)", color: "#00FF88" }}
        >
          EB
        </div>
        {open && (
          <span className="text-ts-text font-mono text-xs font-medium whitespace-nowrap overflow-hidden">
            Evin Bento
          </span>
        )}
      </div>
    </aside>
  )
}

// ── API Keys Panel ─────────────────────────────────────────────

const STORAGE_KEY = "tokensense_api_key"

function generateKey(): string {
  const hex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0")
  return `ts-${hex()}-${hex()}-${hex()}-${hex()}`
}

function ApiKeysPanel() {
  const [apiKey, setApiKey] = useState("")
  const [copied, setCopied] = useState(false)
  const [createdAt] = useState(() => new Date().toLocaleDateString())

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setApiKey(stored)
    } else {
      const fresh = generateKey()
      localStorage.setItem(STORAGE_KEY, fresh)
      setApiKey(fresh)
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = () => {
    const fresh = generateKey()
    localStorage.setItem(STORAGE_KEY, fresh)
    setApiKey(fresh)
    setCopied(false)
  }

  const STEPS = [
    {
      n: "01",
      title: "Add to backend .env",
      code: `TOKENSENSE_API_KEY=${apiKey || "…"}`,
    },
    {
      n: "02",
      title: "Initialize the CLI",
      code: "$ tokensense init --demo",
      hint: "Paste your key when prompted",
    },
    {
      n: "03",
      title: "Start querying",
      code: '$ tokensense ask "explain the auth flow"',
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-ts-accent font-mono text-xs font-bold tracking-[1.5px]">
          API_KEY_MANAGEMENT
        </span>
        <h2 className="text-ts-text font-mono text-2xl font-bold">API Keys</h2>
        <p className="text-ts-muted font-mono text-sm">
          Your secret key authenticates CLI and direct API calls.
        </p>
      </div>

      {/* Key card */}
      <div
        className="flex flex-col gap-4 p-6"
        style={{ background: "#0D0D12", border: "1px solid rgba(0,255,136,0.25)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-ts-text font-mono text-xs font-bold">Default Key</span>
            <span className="text-ts-dim font-mono text-xs">Created {createdAt}</span>
          </div>
          <span
            className="font-mono text-xs px-2 py-0.5"
            style={{
              color: "#00FF88",
              border: "1px solid rgba(0,255,136,0.3)",
              background: "rgba(0,255,136,0.06)",
            }}
          >
            ACTIVE
          </span>
        </div>

        {/* Key display */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ background: "#050508", border: "1px solid #1E1E28" }}
        >
          <span
            className="font-mono text-sm flex-1 break-all"
            style={{ color: "#00FF88", letterSpacing: "0.5px" }}
          >
            {apiKey || "generating…"}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold shrink-0 transition-all"
            style={{
              color: copied ? "#050508" : "#00FF88",
              background: copied ? "#00FF88" : "rgba(0,255,136,0.08)",
              border: "1px solid #00FF88",
            }}
          >
            {copied ? "✓ COPIED" : "COPY"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-ts-dim font-mono text-xs">
            Keep this key secret. Never commit it to version control.
          </p>
          <button
            onClick={handleRegenerate}
            className="font-mono text-xs text-ts-muted hover:text-ts-accent transition-colors shrink-0"
          >
            ↻ Regenerate
          </button>
        </div>
      </div>

      {/* Setup guide */}
      <div
        className="flex flex-col gap-0"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="px-5 py-3"
          style={{
            background: "rgba(0,255,136,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className="text-ts-muted font-mono text-xs font-bold tracking-wider">
            SETUP GUIDE
          </span>
        </div>

        {STEPS.map((step, i) => (
          <div
            key={step.n}
            className="flex gap-5 px-5 py-4"
            style={{
              borderBottom: i < STEPS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined,
            }}
          >
            <span
              className="font-mono text-xs font-bold shrink-0 mt-0.5"
              style={{ color: "#00FF88" }}
            >
              {step.n}
            </span>
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-ts-text font-mono text-xs font-semibold">
                {step.title}
              </span>
              <div
                className="px-3 py-2"
                style={{ background: "#050508", border: "1px solid #1E1E28" }}
              >
                <span
                  className="font-mono text-xs break-all"
                  style={{ color: "#94A3B8" }}
                >
                  {step.code}
                </span>
              </div>
              {step.hint && (
                <span className="text-ts-dim font-mono text-xs">{step.hint}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div
      className="flex flex-col gap-1.5 flex-1 p-4"
      style={{
        background: "#0D0D12",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span className="text-ts-muted font-mono text-xs font-semibold tracking-wider">
        {label}
      </span>
      <span className="text-ts-text font-mono text-2xl font-bold">{value}</span>
      {sub && <span className="text-ts-dim font-mono text-xs">{sub}</span>}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{ background: "rgba(255,255,255,0.06)" }}
    />
  )
}

// ── Charts ────────────────────────────────────────────────────

function QueriesChart({ data }: { data: { date: string; queries: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fill: "#4A4A56", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#4A4A56", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#16161D", border: "1px solid #1E1E28", fontFamily: "monospace", fontSize: 12 }}
          labelStyle={{ color: "#6B6B7B" }}
          itemStyle={{ color: "#00FF88" }}
        />
        <Area type="monotone" dataKey="queries" stroke="#00FF88" strokeWidth={2} fill="url(#qGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function ModelDistribution({ data }: { data: { model: string; count: number; pct: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {data.map(({ model, count, pct }) => (
        <div key={model} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-ts-muted font-mono text-xs">{model}</span>
            <span className="text-ts-text font-mono text-xs font-bold">{pct}</span>
          </div>
          <div className="h-1.5 w-full" style={{ background: "#1E1E28" }}>
            <div
              className="h-full"
              style={{
                width: pct,
                background: model.includes("Claude") ? "#00FF88" : model.includes("GPT") ? "#7DD3FC" : "#FF6600",
              }}
            />
          </div>
          <span className="text-ts-dim font-mono text-xs">{count} queries</span>
        </div>
      ))}
    </div>
  )
}

function TokenSavingsChart({ data }: { data: { name: string; original: number; optimized: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="name" tick={{ fill: "#4A4A56", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#4A4A56", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#16161D", border: "1px solid #1E1E28", fontFamily: "monospace", fontSize: 12 }}
          itemStyle={{ color: "#E4E4E7" }}
        />
        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11, color: "#6B6B7B" }} />
        <Bar dataKey="original" name="Original" fill="#EF4444" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
        <Bar dataKey="optimized" name="Optimized" fill="#00FF88" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Sort types ────────────────────────────────────────────────

type SortKey = keyof Pick<QueryRecord, "timestamp" | "input_tokens" | "output_tokens" | "optimized_tokens" | "cost_usd" | "latency_ms">
type SortDir = "asc" | "desc"

// ── Dashboard Page ────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [limit, setLimit] = useState(100)
  const [showAll, setShowAll] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("timestamp")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<Section>("overview")

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getStats(limit)
      setStats(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats")
    } finally {
      setLoading(false)
    }
  }, [limit])

  const checkHealth = useCallback(async () => {
    try {
      await api.healthCheck()
      setBackendOnline(true)
    } catch {
      setBackendOnline(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    checkHealth()
  }, [fetchStats, checkHealth])

  // 30s auto-refresh when visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchStats()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  // ── Derived data ────────────────────────────────────────────

  const queries = stats?.recent_queries ?? []

  const queriesByDay = queries.reduce<Record<string, number>>((acc, q) => {
    const d = shortDate(q.timestamp)
    acc[d] = (acc[d] ?? 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(queriesByDay).map(([date, count]) => ({ date, queries: count }))

  const modelCounts = queries.reduce<Record<string, number>>((acc, q) => {
    const m = displayModelName(q.model_used)
    acc[m] = (acc[m] ?? 0) + 1
    return acc
  }, {})
  const modelData = Object.entries(modelCounts).map(([model, count]) => ({
    model,
    count,
    pct: queries.length > 0 ? `${((count / queries.length) * 100).toFixed(0)}%` : "0%",
  }))

  const tokenChartData = queries.slice(0, 10).map((q, i) => ({
    name: `Q${i + 1}`,
    original: q.input_tokens,
    optimized: q.optimized_tokens,
  }))

  // ── Sorting ─────────────────────────────────────────────────

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  const sortedQueries = [...queries].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === "asc" ? cmp : -cmp
  })

  const displayedQueries = showAll ? sortedQueries : sortedQueries.slice(0, 5)

  const summary = stats?.summary

  return (
    <div className="flex h-screen bg-ts-page overflow-hidden font-mono">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main */}
      <main className="flex flex-col flex-1 gap-4 p-6 overflow-y-auto">

        {/* API Keys section */}
        {activeSection === "api-keys" && <ApiKeysPanel />}

        {/* Overview section */}
        {activeSection === "overview" && <>

        {/* Top bar */}
        <div
          className="flex items-center justify-between pb-3.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-ts-text font-mono text-lg font-bold">
            Analytics Overview
          </span>
          <div className="flex items-center gap-3">
            {/* Backend status */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    backendOnline === null
                      ? "#4A4A56"
                      : backendOnline
                      ? "#22C55E"
                      : "#EF4444",
                  boxShadow: backendOnline ? "0 0 6px #22C55E" : undefined,
                }}
              />
              <span className="text-ts-dim font-mono text-xs">
                {backendOnline === null ? "checking…" : backendOnline ? "online" : "offline"}
              </span>
            </div>

            {/* Limit */}
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-ts-elevated text-ts-muted font-mono text-xs px-3 py-1.5 outline-none"
              style={{ border: "1px solid #1E1E28" }}
            >
              {[10, 20, 50, 100, 500].map((n) => (
                <option key={n} value={n}>
                  Limit: {n}
                </option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-ts-muted font-mono text-xs hover:text-ts-text transition-colors"
              style={{ border: "1px solid #1E1E28", background: "#16161D" }}
            >
              {loading ? "↻ Refreshing…" : "↻ Refresh"}
            </button>

            {lastUpdated && (
              <span className="text-ts-dim font-mono text-xs">
                Updated {timeAgo(lastUpdated.toISOString())}
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex flex-col gap-3 p-4"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-ts-error font-mono text-sm">{error}</span>
              <button onClick={fetchStats} className="text-ts-accent font-mono text-xs underline ml-auto shrink-0">
                Retry
              </button>
            </div>

            {/* Invalid key helper — clears stale localStorage key so .env.local takes over */}
            {(error.toLowerCase().includes("invalid") || error.toLowerCase().includes("401") || error.toLowerCase().includes("api key")) && (
              <div
                className="flex items-center justify-between gap-4 px-4 py-3"
                style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-ts-text font-mono text-xs font-bold">API key mismatch</span>
                  <span className="text-ts-muted font-mono text-xs">
                    A custom key saved in the browser is overriding{" "}
                    <code className="text-ts-accent">.env.local</code>.
                    Reset to use the environment key.
                  </span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("ts_api_key")
                    localStorage.removeItem("ts_api_url")
                    fetchStats()
                    checkHealth()
                  }}
                  className="shrink-0 px-3 py-1.5 font-mono text-xs font-bold transition-colors"
                  style={{
                    background: "rgba(0,255,136,0.12)",
                    border: "1px solid #00FF88",
                    color: "#00FF88",
                  }}
                >
                  ↺ Reset to env key
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="flex-1 h-20" />)
          ) : summary ? (
            <>
              <StatCard label="TOTAL QUERIES" value={summary.total_queries.toLocaleString()} />
              <StatCard label="AVG REDUCTION" value={formatPct(summary.avg_token_reduction_pct)} />
              <StatCard label="TOTAL COST" value={`$${summary.total_cost_usd.toFixed(4)}`} />
              <StatCard label="AVG LATENCY" value={formatLatency(summary.avg_latency_ms)} />
            </>
          ) : (
            <>
              <StatCard label="TOTAL QUERIES" value="0" />
              <StatCard label="AVG REDUCTION" value="0%" />
              <StatCard label="TOTAL COST" value="$0.00" />
              <StatCard label="AVG LATENCY" value="0 ms" />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="flex gap-3">
          {/* Queries over time */}
          <div
            className="flex-1 flex flex-col gap-3 p-4"
            style={{ background: "#0D0D12", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-ts-muted font-mono text-xs font-bold tracking-wider">
              QUERIES OVER TIME
            </span>
            {loading ? (
              <Skeleton className="h-44 w-full" />
            ) : chartData.length > 0 ? (
              <QueriesChart data={chartData} />
            ) : (
              <div className="h-44 flex items-center justify-center">
                <span className="text-ts-dim font-mono text-xs">No data yet</span>
              </div>
            )}
          </div>

          {/* Model distribution */}
          <div
            className="flex flex-col gap-3 p-4"
            style={{
              background: "#0D0D12",
              border: "1px solid rgba(255,255,255,0.07)",
              width: "240px",
            }}
          >
            <span className="text-ts-muted font-mono text-xs font-bold tracking-wider">
              MODEL DISTRIBUTION
            </span>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : modelData.length > 0 ? (
              <ModelDistribution data={modelData} />
            ) : (
              <span className="text-ts-dim font-mono text-xs">No data yet</span>
            )}
          </div>
        </div>

        {/* Token savings chart */}
        <div
          className="flex flex-col gap-3 p-4"
          style={{ background: "#0D0D12", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-ts-muted font-mono text-xs font-bold tracking-wider">
              TOKEN SAVINGS PER QUERY
            </span>
            <span className="text-ts-dim font-mono text-xs">
              Original vs Optimized — last 10 queries
            </span>
          </div>
          {loading ? (
            <Skeleton className="h-44 w-full" />
          ) : tokenChartData.length > 0 ? (
            <TokenSavingsChart data={tokenChartData} />
          ) : (
            <div className="h-44 flex items-center justify-center">
              <span className="text-ts-dim font-mono text-xs">No data yet</span>
            </div>
          )}
        </div>

        {/* Queries table */}
        <div
          className="flex flex-col"
          style={{ background: "#0D0D12", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Table title */}
          <div
            className="flex items-center justify-between h-11 px-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-ts-text font-mono text-sm font-bold">Recent Queries</span>
          </div>

          {/* Empty / no-data state */}
          {!loading && queries.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12">
              <span className="text-ts-dim font-mono text-sm">No queries recorded yet.</span>
              <Link href="/playground" className="text-ts-accent font-mono text-xs underline">
                Run some queries in the Playground →
              </Link>
            </div>
          )}

          {/* Header */}
          {queries.length > 0 && (
            <div
              className="grid px-4 py-2 gap-2"
              style={{
                gridTemplateColumns: "140px 1fr 120px 80px 80px 80px 90px 90px",
                background: "rgba(255,255,255,0.025)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {(
                [
                  ["Timestamp", "timestamp"],
                  ["Query", null],
                  ["Model", null],
                  ["Input", "input_tokens"],
                  ["Output", "output_tokens"],
                  ["Optimized", "optimized_tokens"],
                  ["Cost", "cost_usd"],
                  ["Latency", "latency_ms"],
                ] as [string, SortKey | null][]
              ).map(([label, key]) => (
                <button
                  key={label}
                  onClick={() => key && handleSort(key)}
                  className={`text-ts-dim font-mono text-xs font-bold tracking-wider text-left ${
                    key ? "hover:text-ts-muted cursor-pointer" : "cursor-default"
                  }`}
                >
                  {label}
                  {key && sortKey === key && (
                    <span className="ml-1 text-ts-accent">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Rows */}
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 px-4 flex items-center gap-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            : displayedQueries.map((q, i) => (
                <div
                  key={q.id}
                  className="grid px-4 py-2.5 gap-2 items-center"
                  style={{
                    gridTemplateColumns: "140px 1fr 120px 80px 80px 80px 90px 90px",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.018)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span className="text-ts-dim font-mono text-xs">{timeAgo(q.timestamp)}</span>
                  <span className="text-ts-muted font-mono text-xs">{truncate(q.query_snippet)}</span>
                  <span className="text-ts-accent font-mono text-xs">{displayModelName(q.model_used)}</span>
                  <span className="text-ts-text font-mono text-xs">{formatTokens(q.input_tokens)}</span>
                  <span className="text-ts-text font-mono text-xs">{formatTokens(q.output_tokens)}</span>
                  <span className="text-ts-success font-mono text-xs">{formatTokens(q.optimized_tokens)}</span>
                  <span className="text-ts-text font-mono text-xs">{formatCost(q.cost_usd)}</span>
                  <span className="text-ts-text font-mono text-xs">{formatLatency(q.latency_ms)}</span>
                </div>
              ))}

          {/* View all toggle */}
          {queries.length > 5 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="py-3 text-ts-accent font-mono text-xs hover:text-ts-text transition-colors"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {showAll ? "Show Less ↑" : `View All → (${queries.length} total)`}
            </button>
          )}
        </div>

        </>} {/* end overview section */}
      </main>
    </div>
  )
}
