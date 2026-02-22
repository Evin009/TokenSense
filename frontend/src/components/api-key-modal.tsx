"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "tokensense_api_key"

function generateKey(): string {
  const hex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0")
  return `ts-${hex()}-${hex()}-${hex()}-${hex()}`
}

interface ApiKeyModalProps {
  onClose: () => void
}

export function ApiKeyModal({ onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("")
  const [copied, setCopied] = useState(false)

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

  const handleRegenerate = () => {
    const fresh = generateKey()
    localStorage.setItem(STORAGE_KEY, fresh)
    setApiKey(fresh)
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      style={{ background: "rgba(5,5,8,0.85)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-6 p-8 w-full max-w-[560px] mx-4"
        style={{
          background: "#0D0D12",
          border: "1px solid #00FF88",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-ts-accent font-mono text-xs font-bold tracking-[1.5px]">
              API_KEY_GENERATOR
            </span>
            <h2 className="text-ts-text font-mono text-xl font-bold">
              Your API Key
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-ts-muted hover:text-ts-text font-mono text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Key display */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{
            background: "#050508",
            border: "1px solid #1E1E28",
          }}
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
            {copied ? "COPIED!" : "COPY"}
          </button>
        </div>

        {/* Instructions */}
        <div className="flex flex-col gap-4">
          <span className="text-ts-muted font-mono text-xs font-bold tracking-wider">
            HOW TO USE
          </span>

          <div className="flex flex-col gap-3">
            {/* Step 1 */}
            <div className="flex flex-col gap-1.5">
              <span className="text-ts-dim font-mono text-xs">
                1 — Add to your backend <span style={{ color: "#00FF88" }}>.env</span>
              </span>
              <div
                className="px-4 py-2.5"
                style={{ background: "#050508", border: "1px solid #1E1E28" }}
              >
                <span className="font-mono text-xs" style={{ color: "#94A3B8" }}>
                  TOKENSENSE_API_KEY=
                  <span style={{ color: "#00FF88" }}>{apiKey}</span>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-1.5">
              <span className="text-ts-dim font-mono text-xs">
                2 — Initialize the CLI
              </span>
              <div
                className="px-4 py-2.5"
                style={{ background: "#050508", border: "1px solid #1E1E28" }}
              >
                <span className="font-mono text-xs" style={{ color: "#94A3B8" }}>
                  <span style={{ color: "#00FF88" }}>$</span> tokensense init --demo
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-1.5">
              <span className="text-ts-dim font-mono text-xs">
                3 — Paste your key when prompted, then start querying
              </span>
              <div
                className="px-4 py-2.5"
                style={{ background: "#050508", border: "1px solid #1E1E28" }}
              >
                <span className="font-mono text-xs" style={{ color: "#94A3B8" }}>
                  <span style={{ color: "#00FF88" }}>$</span> tokensense ask{" "}
                  <span style={{ color: "#7DD3FC" }}>&quot;explain the auth flow&quot;</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #1E1E28" }}>
          <button
            onClick={handleRegenerate}
            className="font-mono text-xs font-medium text-ts-muted hover:text-ts-text transition-colors"
          >
            ↻ Regenerate key
          </button>
          <button
            onClick={onClose}
            className="font-mono text-xs font-bold text-ts-page px-4 py-2 transition-opacity hover:opacity-90"
            style={{ background: "#00FF88" }}
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  )
}
