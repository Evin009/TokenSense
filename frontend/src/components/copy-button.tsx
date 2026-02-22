"use client"

import { useState } from "react"

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold transition-all shrink-0"
      style={{
        color: copied ? "#050508" : "#00FF88",
        background: copied ? "#00FF88" : "rgba(0,255,136,0.08)",
        border: "1px solid #00FF88",
      }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          COPIED!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 4V2.5A0.5 0.5 0 007.5 2H1.5A0.5 0.5 0 001 2.5v6a0.5 0.5 0 00.5.5H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          COPY
        </>
      )}
    </button>
  )
}
