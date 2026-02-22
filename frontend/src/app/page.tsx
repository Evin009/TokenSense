"use client"

import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { useRef } from "react"
import { Navbar } from "@/components/navbar"
import { HeroBg } from "@/components/hero-bg"
import { CursorGlow } from "@/components/cursor-glow"

// ── Animation Variants ────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE } },
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const agentItem: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
}

const cardItem: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

// ── Reusable Reveal ───────────────────────────────────────────

function Reveal({
  children,
  variants = fadeUp,
  delay = 0,
  className,
  style,
}: {
  children: React.ReactNode
  variants?: Variants
  delay?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: variants.hidden,
        show: {
          ...(variants.show as object),
          transition: {
            ...((variants.show as { transition?: object })?.transition ?? {}),
            delay,
          },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ── Data ──────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "TOKENS_PROCESSED: 2,847,192",
  "AVG_REDUCTION: 72.3%",
  "REQUESTS_TODAY: 1,429",
  "LATENCY_P99: 198ms",
  "MODELS_ACTIVE: 3",
  "COST_SAVED: $0.0041",
]

const AGENTS = [
  {
    num: "01",
    name: "Query Agent",
    desc: "Generates vector embeddings via OpenRouter (text-embedding-ada-002) and classifies the task as code, documentation, or general",
    badge: "text-embedding-ada-002",
  },
  {
    num: "02",
    name: "Retrieval Agent",
    desc: "Fetches the top-k most semantically relevant chunks from Actian VectorAI DB using cosine similarity search",
    badge: "top-k similarity",
  },
  {
    num: "03",
    name: "Context Optimizer",
    desc: "Removes duplicate chunks (>80% word overlap), re-ranks by relevance, then truncates to fit the configured token budget",
    badge: "80% dedupe threshold",
  },
  {
    num: "04",
    name: "Routing Agent",
    desc: "Auto-selects Claude 3 Haiku, GPT-4o Mini, or Gemini Pro based on task complexity score and optimized context size",
    badge: "3 models",
  },
  {
    num: "05",
    name: "Telemetry Agent",
    desc: "Calculates per-model cost, persists tokens, latency, and cost metrics to SQLite for dashboard analytics",
    badge: "SQLite persistence",
  },
]

const IMPACT = [
  {
    metric: "72%",
    label: "Avg Token Reduction",
    sub: "Fewer tokens sent to LLMs per query",
    color: "#00FF88",
  },
  {
    metric: "<200ms",
    label: "Pipeline Overhead",
    sub: "Total retrieval + optimization latency",
    color: "#7DD3FC",
  },
  {
    metric: "3",
    label: "LLM Backends",
    sub: "Claude · GPT-4o Mini · Gemini Pro",
    color: "#FF6600",
  },
]

const ROUTING = [
  { task: "General", context: "< 3,000 tokens", model: "Claude 3 Haiku", note: "Fastest · Cheapest" },
  { task: "Documentation", context: "3k – 6k tokens", model: "GPT-4o Mini", note: "Balanced" },
  { task: "Code / Large", context: "> 6,000 tokens", model: "Gemini Pro", note: "Deep reasoning" },
]

const CLI_LINES = [
  { prompt: true, text: 'tokensense ask "explain the authentication flow"' },
  { prompt: false, text: "✓ Indexed 142 chunks", color: "#00FF88" },
  { prompt: false, text: "✓ Context optimized: 8,200 → 2,100 tokens", color: "#00FF88" },
  { prompt: false, text: "✓ Model: claude-3-haiku (auto-selected)", color: "#00FF88" },
  { prompt: false, text: "" },
  { prompt: false, text: "The authentication flow uses verify_api_key middleware..." },
]

// ── Landing Page ──────────────────────────────────────────────

export default function LandingPage() {
  const tickerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-ts-page min-h-screen">
      {/* Cursor glow — landing page only */}
      <CursorGlow />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col items-center bg-ts-page px-16 py-32 text-center">
        {/* Mesh clipped to hero section only */}
        <HeroBg />
        {/* Hero content sits above the canvas */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-8 w-full"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={heroItem}>
            <div
              className="flex items-center justify-center px-4 py-2 rounded-full"
              style={{ border: "1px solid #00FF88" }}
            >
              <span className="text-ts-accent font-mono text-xs font-semibold tracking-wider">
                [ AI_ORCHESTRATION_ENGINE ]
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="text-ts-text font-mono font-extrabold leading-[1.1] text-center max-w-[800px]"
            style={{ fontSize: "56px" }}
          >
            Smarter Context.
            <br />
            Better Answers. Lower Costs.
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="font-mono font-semibold text-center max-w-[640px] leading-relaxed opacity-80"
            style={{ color: "#7DD3FC", fontSize: "17px", letterSpacing: "0.3px" }}
          >
            Smarter context. 72% fewer tokens. Same quality.
          </motion.p>

          <motion.div variants={heroItem} className="flex items-center gap-4">
            <Link
              href="/playground"
              className="flex items-center justify-center font-mono text-sm font-bold text-ts-page bg-ts-accent px-6 py-3 hover:opacity-90 transition-opacity"
            >
              LAUNCH PLAYGROUND →
            </Link>
            <Link
              href="/docs"
              className="flex items-center justify-center font-mono text-sm font-medium text-ts-muted px-6 py-3 hover:text-ts-text transition-colors"
              style={{ border: "1px solid #6B6B7B" }}
            >
              READ DOCS
            </Link>
          </motion.div>

          <motion.p
            variants={heroItem}
            className="font-mono text-xs font-medium opacity-65"
            style={{ color: "#94A3B8", letterSpacing: "0.8px" }}
          >
            v1.0.0 | OpenRouter · Gemini · Actian VectorAI
          </motion.p>
        </motion.div>
      </section>

      {/* ── Quick Install ──────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="flex flex-col items-center gap-6 bg-ts-surface px-16 py-16"
      >
        <motion.span variants={fadeUp} className="text-ts-accent font-mono text-xs font-bold tracking-[1.5px]">
          QUICK START
        </motion.span>
        <motion.h2 variants={fadeUp} className="text-ts-text font-mono text-3xl font-bold text-center">
          Get Started in Seconds
        </motion.h2>
        <motion.div
          variants={scaleIn}
          className="flex items-center gap-4 px-8 py-5 rounded-xl max-w-[640px] w-full"
          style={{ background: "#0F172A", border: "1px solid #00FF88" }}
        >
          <span className="text-ts-accent font-mono text-lg font-bold">$</span>
          <span
            className="font-mono font-semibold"
            style={{ color: "#E2E8F0", fontSize: "16px", letterSpacing: "0.5px" }}
          >
            pip install tokensense
          </span>
        </motion.div>
        <motion.p variants={fadeUp} className="font-mono text-sm opacity-80" style={{ color: "#94A3B8" }}>
          Published to PyPI • v0.1.1 • Python 3.11+
        </motion.p>
      </motion.section>

      {/* ── Stats Ticker ───────────────────────────────────── */}
      <div className="flex items-center bg-ts-surface h-12 overflow-hidden" style={{ borderTop: "1px solid #1E1E28", borderBottom: "1px solid #1E1E28" }}>
        <motion.div
          className="flex items-center gap-16 whitespace-nowrap shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          ref={tickerRef}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((stat, i) => (
            <span
              key={i}
              className="text-ts-accent font-mono text-xs font-semibold shrink-0 px-4"
            >
              {stat}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── How It Works ──────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="flex flex-col items-center gap-6 px-16 py-28"
        style={{ background: "linear-gradient(180deg, #050508 0%, #16161D 100%)" }}
      >
        <motion.div variants={scaleIn}>
          <div
            className="flex items-center justify-center px-3 py-1.5"
            style={{ border: "1px solid #00FF88", background: "rgba(0,255,136,0.06)" }}
          >
            <span className="text-ts-accent font-mono text-xs font-semibold tracking-wider">
              ARCHITECTURE
            </span>
          </div>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="text-ts-text font-mono font-extrabold text-center"
          style={{ fontSize: "48px" }}
        >
          How TokenSense Works
        </motion.h2>
        <motion.p variants={fadeUp} className="font-mono text-base leading-relaxed text-center max-w-[720px] text-ts-muted">
          A five-agent pipeline that transforms your LLM requests into optimized, cost-effective queries
        </motion.p>
      </motion.section>

      {/* ── Agent Pipeline ────────────────────────────────── */}
      <section
        className="flex flex-col items-center gap-16 px-0 py-28"
        style={{
          background: "radial-gradient(ellipse 120% 120% at 50% 50%, #0A0A0D 0%, #050507 100%)",
        }}
      >
        {/* Header */}
        <Reveal variants={fadeUp} className="flex flex-col items-center gap-4">
          <h2
            className="font-mono font-extrabold text-center"
            style={{ color: "#34D399", fontSize: "48px", letterSpacing: "-1px" }}
          >
            Agent Pipeline
          </h2>
          <p
            className="font-mono font-medium text-center"
            style={{ color: "#34D399", fontSize: "16px", letterSpacing: "0.3px" }}
          >
            Five-stage intelligent processing system
          </p>
          <div className="w-48 opacity-60" style={{ height: "2px", background: "#34D399" }} />
        </Reveal>

        {/* Staggered agent rows */}
        <motion.div
          className="flex flex-col w-full max-w-[820px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13 } } }}
        >
          {AGENTS.map((agent, i) => (
            <motion.div key={agent.num} variants={agentItem}>
              <div
                className="flex items-center gap-6 px-10 py-8 w-full"
                style={{ background: "rgba(52,211,153,0.04)" }}
              >
                <span
                  className="font-mono font-bold text-2xl shrink-0 w-10"
                  style={{ color: "#34D399" }}
                >
                  {agent.num}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-ts-text font-mono text-base font-bold">{agent.name}</span>
                    <span
                      className="font-mono text-xs px-2 py-0.5"
                      style={{
                        color: "#34D399",
                        border: "1px solid rgba(52,211,153,0.4)",
                        background: "rgba(52,211,153,0.06)",
                      }}
                    >
                      {agent.badge}
                    </span>
                  </div>
                  <p className="text-ts-muted font-mono text-sm leading-relaxed">{agent.desc}</p>
                </div>
              </div>
              {i < AGENTS.length - 1 && (
                <div className="flex items-center justify-center w-full py-1">
                  <motion.span
                    className="font-mono text-lg"
                    style={{ color: "rgba(52,211,153,0.5)" }}
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ↓
                  </motion.span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Impact ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-16 bg-ts-page px-16 py-24">
        <Reveal variants={fadeUp}>
          <h2
            className="text-ts-text font-mono font-extrabold text-center"
            style={{ fontSize: "38px", letterSpacing: "-0.5px" }}
          >
            THE IMPACT
          </h2>
        </Reveal>

        <motion.div
          className="flex items-stretch gap-6 w-full max-w-[1100px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        >
          {IMPACT.map(({ metric, label, sub, color }) => (
            <motion.div
              key={label}
              variants={cardItem}
              className="flex-1 flex flex-col gap-3 bg-ts-surface p-8"
              style={{ border: `1px solid ${color}22` }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <span
                className="font-mono font-extrabold"
                style={{ color, fontSize: "52px", lineHeight: 1 }}
              >
                {metric}
              </span>
              <span className="text-ts-text font-mono text-base font-bold">{label}</span>
              <span className="text-ts-muted font-mono text-sm">{sub}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Model Routing Table ────────────────────────────── */}
      <Reveal
        variants={fadeUp}
        className="flex flex-col items-center gap-10 bg-ts-surface px-16 py-20"
        style={{ display: "flex" }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-ts-accent font-mono text-xs font-bold tracking-[1.5px]">
            INTELLIGENT ROUTING
          </span>
          <h2 className="text-ts-text font-mono text-3xl font-bold text-center">
            Right Model for Every Query
          </h2>
        </div>
        <div className="w-full max-w-[900px]" style={{ border: "1px solid #1E1E28" }}>
          <div
            className="grid grid-cols-4 px-6 py-3"
            style={{ background: "rgba(0,255,136,0.04)", borderBottom: "1px solid #1E1E28" }}
          >
            {["Task Type", "Context Size", "Model Selected", "Notes"].map((h) => (
              <span key={h} className="text-ts-dim font-mono text-xs font-bold tracking-wider">
                {h}
              </span>
            ))}
          </div>
          {ROUTING.map((row, i) => (
            <motion.div
              key={row.task}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="grid grid-cols-4 px-6 py-4"
              style={{
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.018)",
                borderBottom: i < ROUTING.length - 1 ? "1px solid #1E1E28" : undefined,
              }}
            >
              <span className="text-ts-text font-mono text-sm font-medium">{row.task}</span>
              <span className="text-ts-muted font-mono text-sm">{row.context}</span>
              <span className="text-ts-accent font-mono text-sm font-semibold">{row.model}</span>
              <span className="text-ts-dim font-mono text-sm">{row.note}</span>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* ── CLI Demo ──────────────────────────────────────── */}
      <section className="flex flex-col gap-12 bg-ts-page px-16 py-20">
        <Reveal variants={fadeUp}>
          <div className="flex flex-col gap-3">
            <span className="text-ts-accent font-mono text-xs font-bold tracking-[1.5px]">
              HOW IT WORKS
            </span>
            <h2 className="text-ts-text font-mono text-3xl font-bold">Before &amp; After</h2>
            <p className="text-ts-muted font-mono text-sm max-w-[500px] leading-relaxed">
              TokenSense intercepts your query, retrieves only the relevant context,
              compresses it, and routes to the optimal model — all in under 200ms.
            </p>
          </div>
        </Reveal>

        <div className="flex items-stretch gap-6 max-w-[1100px]">
          {/* Terminal — slide from left */}
          <Reveal
            variants={fadeLeft}
            className="flex-1"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div
              className="flex-1 p-6 flex flex-col gap-3"
              style={{ background: "#040C08", border: "1px solid rgba(0,255,136,0.3)" }}
            >
              <div
                className="flex items-center gap-2 pb-3"
                style={{ borderBottom: "1px solid rgba(0,255,136,0.15)" }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#FF6600" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
                <span className="text-ts-dim font-mono text-xs ml-2">terminal</span>
              </div>
              {CLI_LINES.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-2"
                >
                  {line.prompt && (
                    <span className="text-ts-accent font-mono text-sm shrink-0">$</span>
                  )}
                  <span
                    className="font-mono text-sm leading-relaxed"
                    style={{
                      color: line.color || (line.prompt ? "#E2E8F0" : "#6B6B7B"),
                    }}
                  >
                    {line.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* Token comparison — slide from right */}
          <Reveal variants={fadeRight}>
            <div
              className="flex flex-col items-center justify-center gap-6 p-8"
              style={{ background: "#0D0D12", border: "1px solid #1E1E28", minWidth: "240px" }}
            >
              <span className="text-ts-muted font-mono text-xs font-bold tracking-wider">
                TOKEN SAVINGS
              </span>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex items-center justify-center px-6 py-4 w-full"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <span className="text-ts-error font-mono text-2xl font-bold">8,200</span>
                </div>
                <span className="text-ts-muted font-mono text-xs">Before</span>
              </div>

              <motion.span
                className="text-ts-accent font-mono text-2xl"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                ↓
              </motion.span>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex items-center justify-center px-6 py-4 w-full"
                  style={{
                    background: "rgba(0,255,136,0.1)",
                    border: "1px solid rgba(0,255,136,0.3)",
                  }}
                >
                  <span className="text-ts-accent font-mono text-2xl font-bold">2,100</span>
                </div>
                <span className="text-ts-muted font-mono text-xs">After</span>
              </div>

              <div
                className="flex items-center justify-center px-4 py-2"
                style={{ background: "rgba(0,255,136,0.15)", border: "1px solid #00FF88" }}
              >
                <span className="text-ts-accent font-mono text-sm font-bold">-74% SAVED</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Demo Video ─────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-8 bg-ts-page px-16 py-20">
        <Reveal variants={fadeUp} className="flex flex-col items-center gap-3">
          <h2 className="text-ts-text font-mono text-3xl font-bold text-center">
            SEE IT IN ACTION
          </h2>
          <p
            className="font-mono font-medium text-center max-w-[600px] leading-relaxed opacity-80"
            style={{ color: "#7DD3FC", letterSpacing: "0.2px" }}
          >
            Watch how TokenSense optimizes your LLM workflow in under 2 minutes
          </p>
        </Reveal>

        <Reveal variants={scaleIn}>
          <div
            className="flex flex-col items-center justify-center gap-5 w-full max-w-[960px] rounded-2xl"
            style={{ height: "480px", background: "#0D0D12", border: "2px solid #00FF88" }}
          >
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: "radial-gradient(circle, #00FF88 0%, rgba(0,255,136,0.2) 100%)",
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-ts-page text-2xl">▶</span>
            </motion.div>
            <span className="text-ts-muted font-mono text-base font-semibold">
              Demo Video Coming Soon
            </span>
          </div>
        </Reveal>

        <Reveal variants={fadeUp}>
          <p className="font-mono text-xs opacity-70" style={{ color: "#94A3B8", letterSpacing: "0.3px" }}>
            Complete walkthrough: installation → indexing → optimization → results
          </p>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Reveal variants={fadeUp}>
        <footer
          className="flex flex-col gap-6 px-20 py-12 bg-ts-surface"
          style={{ borderTop: "1px solid #1E1E28" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-ts-accent font-mono text-base font-semibold tracking-wider">
              TokenSense
            </span>
            <div className="flex items-center gap-8">
              {[
                { label: "GitHub", href: "https://github.com" },
                { label: "Docs", href: "/docs" },
                { label: "Playground", href: "/playground" },
                { label: "API Reference", href: "/docs" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-ts-muted font-mono text-xs hover:text-ts-text transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div
            className="flex items-center justify-center pt-6"
            style={{ borderTop: "1px solid #1E1E28" }}
          >
            <span className="text-ts-dim font-mono text-xs">
              Built for the Hackathon · MIT License
            </span>
          </div>
        </footer>
      </Reveal>
    </div>
  )
}
