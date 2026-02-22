"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { api, saveSettings, loadSettings } from "@/lib/api"
import {
  displayModelName,
  formatCost,
  formatLatency,
  formatTokens,
  estimateTokens,
} from "@/lib/utils"
import type { AskResponse, PlaygroundState } from "@/lib/types"

// ── Settings Modal ────────────────────────────────────────────

function SettingsModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [url, setUrl] = useState("")
  const [key, setKey] = useState("")
  const [useDemo, setUseDemo] = useState(false)

  useEffect(() => {
    if (open) {
      const s = loadSettings()
      setUrl(s.url || "http://localhost:8000")
      setKey(s.key)
      setUseDemo(s.useDemo)
    }
  }, [open])

  function handleToggleDemo(on: boolean) {
    setUseDemo(on)
    // Using localhost for both demo and local during development
    setUrl("http://localhost:8000")
  }

  function handleSave() {
    saveSettings(url, key)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex flex-col gap-6 p-8 w-full max-w-md"
        style={{ background: "#0D0D12", border: "1px solid rgba(0,255,136,0.3)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-ts-text font-mono text-base font-bold">API Settings</span>
          <button onClick={onClose} className="text-ts-muted hover:text-ts-text font-mono text-xl">
            ✕
          </button>
        </div>

        {/* Demo toggle */}
        <div
          className="flex items-center justify-between p-4"
          style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)" }}
        >
          <div>
            <p className="text-ts-text font-mono text-sm font-semibold">Use Demo Server</p>
            <p className="text-ts-muted font-mono text-xs mt-0.5">
              Connect to local backend at localhost:8000
            </p>
          </div>
          <button
            onClick={() => handleToggleDemo(!useDemo)}
            className="relative w-11 h-6 transition-colors"
            style={{
              background: useDemo ? "#00FF88" : "#1E1E28",
              border: `1px solid ${useDemo ? "#00FF88" : "#4A4A56"}`,
              borderRadius: "12px",
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 transition-transform"
              style={{
                background: useDemo ? "#050508" : "#6B6B7B",
                borderRadius: "50%",
                transform: useDemo ? "translateX(22px)" : "translateX(2px)",
              }}
            />
          </button>
        </div>

        {/* API URL */}
        <div className="flex flex-col gap-2">
          <label className="text-ts-muted font-mono text-xs font-semibold tracking-wider">
            API URL
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="bg-ts-elevated text-ts-text font-mono text-sm px-4 py-3 outline-none w-full"
            style={{ border: "1px solid #1E1E28" }}
          />
        </div>

        {/* API Key */}
        <div className="flex flex-col gap-2">
          <label className="text-ts-muted font-mono text-xs font-semibold tracking-wider">
            API KEY
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="your-tokensense-api-key"
            className="bg-ts-elevated text-ts-text font-mono text-sm px-4 py-3 outline-none w-full"
            style={{ border: "1px solid #1E1E28" }}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-ts-accent text-ts-page font-mono text-sm font-bold hover:opacity-90 transition-opacity"
        >
          SAVE SETTINGS
        </button>
      </div>
    </div>
  )
}

// ── Meta Card ─────────────────────────────────────────────────

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3"
      style={{ background: "#16161D", border: "1px solid rgba(0,255,136,0.12)" }}
    >
      <span className="text-ts-dim font-mono text-xs font-semibold tracking-wider">
        {label}
      </span>
      <span className="text-ts-text font-mono text-sm font-bold">{value}</span>
    </div>
  )
}

// ── Playground Page ───────────────────────────────────────────

export default function PlaygroundPage() {
  const [query, setQuery] = useState("")
  const [tokenBudget, setTokenBudget] = useState(8000)
  const [optimizeCtx, setOptimizeCtx] = useState(true)
  const [state, setState] = useState<PlaygroundState>({ status: "idle" })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const liveTokens = estimateTokens(query)

  useEffect(() => {
    const s = loadSettings()
    setApiKeyConfigured(!!s.key)
  }, [settingsOpen])

  const handleRun = useCallback(async () => {
    if (!query.trim()) return
    setState({ status: "loading" })
    try {
      const data: AskResponse = await api.ask({
        query,
        token_budget: optimizeCtx ? tokenBudget : undefined,
      })
      if (!data.answer) {
        setState({ status: "no-data" })
      } else {
        setState({ status: "success", data })
      }
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unexpected error",
      })
    }
  }, [query, tokenBudget, optimizeCtx])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        handleRun()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [handleRun])

  const isLoading = state.status === "loading"
  const result = state.status === "success" ? state.data : null

  return (
    <div className="flex flex-col h-screen bg-ts-page overflow-hidden">
      <Navbar />

      {/* Subbar */}
      <div
        className="flex items-center justify-between h-13 px-12 bg-ts-surface shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", height: "52px" }}
      >
        <span className="text-ts-text font-mono text-base font-bold">Playground</span>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 hover:border-ts-accent transition-colors"
          style={{
            background: "#16161D",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-ts-muted font-mono text-xs">API Key:</span>
          <span className="text-ts-accent font-mono text-xs">
            {apiKeyConfigured ? "••••••••" : "not set"}
          </span>
          <span className="text-ts-muted font-mono text-sm">⚙</span>
        </button>
      </div>

      {/* Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel — Query Input ────────────────────── */}
        <div
          className="flex flex-col w-1/2"
          style={{
            background: "#040C08",
            borderRight: "2px solid rgba(0,255,136,0.3)",
          }}
        >
          {/* Left top bar */}
          <div
            className="flex items-center justify-between h-[52px] px-6 shrink-0"
            style={{ borderBottom: "1px solid rgba(0,255,136,0.2)" }}
          >
            <span className="text-ts-text font-mono text-xs font-bold tracking-wider">
              QUERY INPUT
            </span>
            <span className="text-ts-accent font-mono text-xs font-semibold">
              {liveTokens} tokens
            </span>
          </div>

          {/* Textarea */}
          <div className="flex-1 p-6 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a question, paste code, or describe a task..."
              className="w-full h-full resize-none bg-transparent text-ts-text font-mono text-sm leading-relaxed outline-none placeholder:text-ts-dim"
              disabled={isLoading}
            />
          </div>

          {/* Controls */}
          <div
            className="flex flex-col gap-4 p-6 shrink-0"
            style={{ borderTop: "1px solid rgba(0,255,136,0.2)", background: "#060E0A" }}
          >
            {/* Token budget slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-ts-muted font-mono text-xs font-semibold tracking-wider">
                  TOKEN BUDGET
                </span>
                <span className="text-ts-accent font-mono text-xs font-bold">
                  {tokenBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={16000}
                step={500}
                value={tokenBudget}
                onChange={(e) => setTokenBudget(Number(e.target.value))}
                className="w-full h-1 appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00FF88 0%, #00FF88 ${((tokenBudget - 1000) / 15000) * 100}%, #1E1E28 ${((tokenBudget - 1000) / 15000) * 100}%, #1E1E28 100%)`,
                  accentColor: "#00FF88",
                }}
              />
              <div className="flex justify-between">
                <span className="text-ts-dim font-mono text-xs">1k</span>
                <span className="text-ts-dim font-mono text-xs">16k</span>
              </div>
            </div>

            {/* Optimize toggle */}
            <div className="flex items-center justify-between">
              <span className="text-ts-muted font-mono text-xs font-semibold tracking-wider">
                OPTIMIZE CONTEXT
              </span>
              <button
                onClick={() => setOptimizeCtx((v) => !v)}
                className="relative w-10 h-5 transition-colors"
                style={{
                  background: optimizeCtx ? "#00FF88" : "#1E1E28",
                  border: `1px solid ${optimizeCtx ? "#00FF88" : "#4A4A56"}`,
                  borderRadius: "10px",
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 transition-transform"
                  style={{
                    background: optimizeCtx ? "#050508" : "#6B6B7B",
                    borderRadius: "50%",
                    transform: optimizeCtx ? "translateX(20px)" : "translateX(2px)",
                  }}
                />
              </button>
            </div>

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={!query.trim() || isLoading}
              className="w-full py-3 font-mono text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{
                background: !query.trim() || isLoading ? "#1E1E28" : "#00FF88",
                color: !query.trim() || isLoading ? "#4A4A56" : "#050508",
                cursor: !query.trim() || isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  RUNNING...
                </>
              ) : (
                "RUN QUERY →"
              )}
            </button>

            <p className="text-ts-dim font-mono text-xs text-center">
              ⌘ Enter to run
            </p>
          </div>
        </div>

        {/* ── Right Panel — Response ──────────────────────── */}
        <div className="flex flex-col w-1/2 bg-ts-surface overflow-hidden">
          {/* Right top bar */}
          <div
            className="flex items-center h-[52px] px-6 shrink-0"
            style={{ borderBottom: "1px solid rgba(0,255,136,0.2)", background: "#16161D" }}
          >
            <span className="text-ts-text font-mono text-xs font-bold tracking-wider">
              RESPONSE
            </span>
          </div>

          {/* Meta cards */}
          <div
            className="flex items-center gap-2.5 px-5 py-3 shrink-0 flex-wrap"
            style={{
              borderBottom: "1px solid rgba(0,255,136,0.15)",
              background: "#16161D",
            }}
          >
            <MetaCard label="TOKENS USED" value={result ? formatTokens(result.input_tokens) : "—"} />
            <MetaCard label="EST. COST" value={result ? formatCost(result.cost_usd) : "—"} />
            <MetaCard label="MODEL" value={result ? displayModelName(result.model) : "—"} />
            <MetaCard label="LATENCY" value={result ? formatLatency(result.latency_ms) : "—"} />
          </div>

          {/* Response output */}
          <div className="flex-1 overflow-y-auto p-6 bg-ts-page">
            {state.status === "idle" && (
              <p className="text-ts-dim font-mono text-sm">
                Run a query to see the response here.
              </p>
            )}

            {state.status === "loading" && (
              <div className="flex items-center gap-3">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-ts-accent border-t-transparent rounded-full" />
                <span className="text-ts-muted font-mono text-sm">Processing your query…</span>
              </div>
            )}

            {state.status === "error" && (
              <div
                className="flex flex-col gap-3 p-4"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <span className="text-ts-error font-mono text-xs font-bold tracking-wider">
                  ⚠ ERROR
                </span>
                <p className="text-ts-error font-mono text-sm">{state.message}</p>
                {state.message.includes("Invalid API key") || state.message.includes("401") ? (
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="text-ts-accent font-mono text-xs underline text-left"
                  >
                    Update API key in settings →
                  </button>
                ) : null}
              </div>
            )}

            {state.status === "no-data" && (
              <div
                className="flex flex-col gap-3 p-4"
                style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)" }}
              >
                <span className="text-ts-info font-mono text-xs font-bold tracking-wider">
                  ℹ NO INDEXED DATA
                </span>
                <p className="text-ts-muted font-mono text-sm leading-relaxed">
                  No indexed data found. Index a codebase first to get context-aware answers.
                </p>
                <a href="/docs" className="text-ts-accent font-mono text-xs underline">
                  View setup docs →
                </a>
              </div>
            )}

            {state.status === "success" && result && (
              <div className="flex flex-col gap-4">
                <pre className="text-ts-text font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {result.answer}
                </pre>
              </div>
            )}
          </div>

          {/* Context optimization panel */}
          {optimizeCtx && (
            <div
              className="flex flex-col gap-4 p-6 shrink-0"
              style={{
                background: "#16161D",
                borderTop: "1px solid rgba(0,255,136,0.12)",
              }}
            >
              <span className="text-ts-muted font-mono text-xs font-bold tracking-wider">
                CONTEXT OPTIMIZATION
              </span>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-ts-dim font-mono text-xs">Original</span>
                  <span className="text-ts-text font-mono text-sm font-bold">
                    {result ? formatTokens(result.input_tokens) : "—"}
                  </span>
                </div>
                <span className="text-ts-accent font-mono text-lg">→</span>
                <div className="flex flex-col gap-1">
                  <span className="text-ts-dim font-mono text-xs">Optimized</span>
                  <span className="text-ts-accent font-mono text-sm font-bold">
                    {result ? formatTokens(result.optimized_tokens) : "—"}
                  </span>
                </div>
                {result && (
                  <div
                    className="ml-auto px-3 py-1.5"
                    style={{
                      background: "rgba(0,255,136,0.12)",
                      border: "1px solid rgba(0,255,136,0.4)",
                    }}
                  >
                    <span className="text-ts-accent font-mono text-xs font-bold">
                      -{result.context_reduction_pct.toFixed(1)}% SAVED
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
