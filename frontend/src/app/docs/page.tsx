"use client"

import { useState, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DOC_NAV, DOC_CONTENT, ALL_SECTIONS } from "@/lib/docs-content"
import type { DocBlock, DocSection } from "@/lib/docs-content"

// ── Code Block ────────────────────────────────────────────────

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="relative group"
      style={{ background: "#0A0A0D", border: "1px solid #1E1E28" }}
    >
      {/* lang badge + copy */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: "1px solid #1E1E28" }}
      >
        <span className="text-ts-dim font-mono text-xs">{lang}</span>
        <button
          onClick={copy}
          className="text-ts-dim font-mono text-xs hover:text-ts-accent transition-colors"
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-ts-text font-mono text-sm leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ── Content Renderer ──────────────────────────────────────────

function renderBlock(block: DocBlock, i: number) {
  switch (block.type) {
    case "p":
      return (
        <p key={i} className="text-ts-muted font-mono text-sm leading-relaxed">
          {block.text}
        </p>
      )
    case "h2":
      return (
        <h2
          key={i}
          id={block.id}
          className="text-ts-text font-mono text-lg font-bold mt-4"
          style={{ paddingTop: "8px", borderTop: "1px solid #1E1E28" }}
        >
          {block.text}
        </h2>
      )
    case "h3":
      return (
        <h3 key={i} className="text-ts-text font-mono text-base font-semibold">
          {block.text}
        </h3>
      )
    case "code":
      return <CodeBlock key={i} lang={block.lang} code={block.code} />
    case "table":
      return (
        <div
          key={i}
          className="overflow-x-auto"
          style={{ border: "1px solid #1E1E28" }}
        >
          <table className="w-full font-mono text-sm">
            <thead>
              <tr style={{ background: "rgba(0,255,136,0.04)", borderBottom: "1px solid #1E1E28" }}>
                {block.headers.map((h) => (
                  <th
                    key={h}
                    className="text-ts-dim text-xs font-bold tracking-wider text-left px-4 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: ri % 2 !== 0 ? "rgba(255,255,255,0.018)" : "transparent",
                    borderBottom: ri < block.rows.length - 1 ? "1px solid #1E1E28" : undefined,
                  }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-2.5 text-xs ${
                        ci === 0 ? "text-ts-text font-semibold" : "text-ts-muted"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case "callout":
      return (
        <div
          key={i}
          className="flex gap-3 p-4"
          style={{
            background: block.variant === "info" ? "rgba(59,130,246,0.06)" : "rgba(255,102,0,0.06)",
            border: `1px solid ${block.variant === "info" ? "rgba(59,130,246,0.25)" : "rgba(255,102,0,0.25)"}`,
          }}
        >
          <span className="font-mono text-sm">
            {block.variant === "info" ? "ℹ" : "⚠"}
          </span>
          <p className="text-ts-muted font-mono text-sm leading-relaxed">{block.text}</p>
        </div>
      )
    case "step":
      return (
        <div key={i} className="flex gap-4">
          <div
            className="flex items-center justify-center w-7 h-7 shrink-0 font-mono text-xs font-bold"
            style={{
              background: "rgba(0,255,136,0.12)",
              border: "1px solid rgba(0,255,136,0.4)",
              color: "#00FF88",
            }}
          >
            {block.num}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-ts-text font-mono text-sm font-bold">{block.title}</span>
            {block.desc && (
              <span className="text-ts-muted font-mono text-xs">{block.desc}</span>
            )}
          </div>
        </div>
      )
    default:
      return null
  }
}

// ── Docs Page ─────────────────────────────────────────────────

function DocsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialSection = searchParams.get("section") ?? "quick-start"
  const [activeId, setActiveId] = useState(initialSection)
  const [search, setSearch] = useState("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(DOC_NAV.map((g) => [g.section, true]))
  )

  function navigate(id: string) {
    setActiveId(id)
    router.push(`/docs?section=${id}`, { scroll: false })
  }

  function toggleSection(section: string) {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return DOC_NAV.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0)
  }, [search])

  const doc: DocSection = DOC_CONTENT[activeId] ?? DOC_CONTENT["quick-start"]

  const currentIndex = ALL_SECTIONS.findIndex((s) => s.id === activeId)
  const prev = currentIndex > 0 ? ALL_SECTIONS[currentIndex - 1] : null
  const next = currentIndex < ALL_SECTIONS.length - 1 ? ALL_SECTIONS[currentIndex + 1] : null

  const navGroups = filtered ?? DOC_NAV

  return (
    <div className="flex flex-col h-screen bg-ts-page overflow-hidden">
      <Navbar />

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 shrink-0"
        style={{
          height: "56px",
          background: "#0D0D12",
          borderBottom: "1px solid rgba(0,255,136,0.12)",
        }}
      >
        <span className="text-ts-text font-mono text-sm font-bold tracking-wider">DOCS</span>
      </div>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ──────────────────────────────────── */}
        <aside
          className="flex flex-col shrink-0 overflow-y-auto"
          style={{
            width: "260px",
            background: "#0D0D12",
            borderRight: "1px solid rgba(0,255,136,0.15)",
          }}
        >
          <div className="p-4 flex flex-col gap-3">
            {/* Logo */}
            <span className="text-ts-accent font-mono text-sm font-bold tracking-wider pb-1">
              TokenSense
            </span>

            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search docs..."
              className="bg-ts-elevated text-ts-text font-mono text-xs px-3 py-2 outline-none w-full"
              style={{ border: "1px solid rgba(0,255,136,0.15)" }}
            />
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 px-3 pb-6">
            {navGroups.map((group) => {
              const isExpanded = expandedSections[group.section] !== false
              return (
                <div key={group.section} className="flex flex-col gap-0.5">
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(group.section)}
                    className="flex items-center justify-between px-2 py-1.5 text-ts-dim font-mono text-xs font-bold tracking-widest hover:text-ts-muted transition-colors"
                  >
                    {group.section}
                    <span>{isExpanded ? "▾" : "▸"}</span>
                  </button>

                  {/* Items */}
                  {isExpanded &&
                    group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className="flex items-center px-3 py-1.5 font-mono text-xs transition-colors text-left w-full"
                        style={
                          activeId === item.id
                            ? {
                                color: "#00FF88",
                                background: "rgba(0,255,136,0.06)",
                                borderLeft: "2px solid #00FF88",
                              }
                            : { color: "#6B6B7B", paddingLeft: "14px" }
                        }
                      >
                        {item.label}
                      </button>
                    ))}

                  {/* Divider between sections */}
                  <div className="h-px my-1" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>
              )
            })}

            {filtered?.length === 0 && (
              <p className="text-ts-dim font-mono text-xs px-3 py-4">No results for &ldquo;{search}&rdquo;</p>
            )}
          </nav>
        </aside>

        {/* ── Center Content ──────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-9 flex flex-col gap-5">
          {/* Breadcrumb */}
          <span className="text-ts-dim font-mono text-xs">{doc.breadcrumb}</span>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-ts-text font-mono text-2xl font-bold">{doc.title}</h1>
            <span className="text-ts-muted font-mono text-xs">{doc.meta}</span>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: "#1E1E28" }} />

          {/* Content blocks */}
          <div className="flex flex-col gap-5">
            {doc.content.map((block, i) => renderBlock(block, i))}
          </div>

          {/* Prev / Next */}
          <div
            className="flex items-center justify-between pt-6 mt-4"
            style={{ borderTop: "1px solid rgba(0,255,136,0.15)" }}
          >
            {prev ? (
              <button
                onClick={() => navigate(prev.id)}
                className="flex flex-col gap-0.5 text-left hover:text-ts-accent transition-colors"
              >
                <span className="text-ts-dim font-mono text-xs">← Previous</span>
                <span className="text-ts-muted font-mono text-sm">{prev.label}</span>
              </button>
            ) : <div />}

            {next ? (
              <button
                onClick={() => navigate(next.id)}
                className="flex flex-col gap-0.5 text-right hover:text-ts-accent transition-colors"
              >
                <span className="text-ts-dim font-mono text-xs">Next →</span>
                <span className="text-ts-muted font-mono text-sm">{next.label}</span>
              </button>
            ) : <div />}
          </div>
        </main>

        {/* ── Right TOC ──────────────────────────────────── */}
        <aside
          className="flex flex-col shrink-0 p-5 gap-2 overflow-y-auto"
          style={{
            width: "200px",
            background: "#0D0D12",
            borderLeft: "1px solid rgba(0,255,136,0.15)",
          }}
        >
          <span
            className="text-ts-dim font-mono text-xs font-bold tracking-widest"
            style={{ letterSpacing: "1px" }}
          >
            ON THIS PAGE
          </span>
          {doc.tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-ts-muted font-mono text-xs hover:text-ts-accent transition-colors py-0.5"
            >
              {item.label}
            </a>
          ))}
        </aside>
      </div>
    </div>
  )
}

export default function DocsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-ts-page">
          <span className="text-ts-muted font-mono text-sm">Loading docs…</span>
        </div>
      }
    >
      <DocsInner />
    </Suspense>
  )
}
