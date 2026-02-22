"use client"

import Link from "next/link"
import { motion, Variants, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Copy, Check } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { HeroBg } from "@/components/hero-bg"
import { CursorGlow } from "@/components/cursor-glow"

// ── Easing ────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const
const EASE_IN = [0.36, 0, 0.78, 0] as const

// ── Variants ──────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

// Premium clip-path curtain — text rises from behind an invisible wall
const clipReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", opacity: 0, y: 12 },
  show: {
    clipPath: "inset(0 0 0% 0)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
}

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
}

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

const agentItem: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
}

// Scan reveal — used for table rows, slides in from the left
const rowScan: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
}

// ── Utility Components ────────────────────────────────────────

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

// Animated counter — counts from 0 to `to` using ease-out-expo
function CountUp({
  to,
  suffix = "",
  duration = 1600,
}: {
  to: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setVal(Math.round(eased * to))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration])

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  )
}

// Typewriter — types text character by character when in view
function Typewriter({
  text,
  triggerRef,
  speed = 38,
}: {
  text: string
  triggerRef: React.RefObject<Element | null>
  speed?: number
}) {
  const inView = useInView(triggerRef as React.RefObject<Element>, { once: true })
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!inView) return
    let i = 0
    setDisplayed("")
    setDone(false)
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(id)
  }, [inView, text, speed])

  return (
    <>
      {displayed}
      {!done && <span className="cursor-blink" style={{ color: "#00FF88" }}>▋</span>}
    </>
  )
}

// Copy command box
function CopyCommand({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      variants={scaleIn}
      className="flex items-center justify-between gap-4 px-8 py-5 rounded-xl max-w-[640px] w-full"
      style={{ background: "#0F172A", border: "1px solid #00FF88" }}
    >
      <div className="flex items-center gap-4">
        <span className="text-ts-accent font-mono text-lg font-bold select-none">$</span>
        <span
          className="font-mono font-semibold"
          style={{ color: "#E2E8F0", fontSize: "16px", letterSpacing: "0.5px" }}
        >
          {text}
        </span>
      </div>
      <button
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy to clipboard"}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold transition-all"
        style={{
          color: copied ? "#050508" : "#00FF88",
          background: copied ? "#00FF88" : "rgba(0,255,136,0.08)",
          border: "1px solid rgba(0,255,136,0.35)",
          borderRadius: "6px",
        }}
      >
        {copied ? <><Check size={13} strokeWidth={2.5} /> Copied!</> : <><Copy size={13} strokeWidth={2} /> Copy</>}
      </button>
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
  { countTo: 72, suffix: "%", metric: "72%", label: "Avg Token Reduction", sub: "Fewer tokens sent to LLMs per query", color: "#00FF88" },
  { countTo: null, metric: "<200ms", label: "Pipeline Overhead", sub: "Total retrieval + optimization latency", color: "#7DD3FC" },
  { countTo: 3, suffix: "", metric: "3", label: "LLM Backends", sub: "Claude · GPT-4o Mini · Gemini Pro", color: "#FF6600" },
]

const ROUTING = [
  { task: "General", context: "< 3,000 tokens", model: "Claude 3 Haiku", note: "Fastest · Cheapest" },
  { task: "Documentation", context: "3k – 6k tokens", model: "GPT-4o Mini", note: "Balanced" },
  { task: "Code / Large", context: "> 6,000 tokens", model: "Gemini Pro", note: "Deep reasoning" },
]

const CLI_LINES = [
  { prompt: true, text: 'tokensense ask "explain the authentication flow"', typewriter: true },
  { prompt: false, text: "✓ Indexed 142 chunks", color: "#00FF88" },
  { prompt: false, text: "✓ Context optimized: 8,200 → 2,100 tokens", color: "#00FF88" },
  { prompt: false, text: "✓ Model: claude-3-haiku (auto-selected)", color: "#00FF88" },
  { prompt: false, text: "" },
  { prompt: false, text: "The authentication flow uses verify_api_key middleware..." },
]

// ── Landing Page ──────────────────────────────────────────────

export default function LandingPage() {
  const tickerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-ts-page min-h-screen">
      <CursorGlow />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col items-center bg-ts-page px-16 py-32 text-center">
        <HeroBg />

        {/* Subtle bottom fade so mesh doesn't bleed into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #050508)" }}
        />

        <motion.div
          className="relative z-10 flex flex-col items-center gap-8 w-full"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          {/* Badge */}
          <motion.div variants={heroItem}>
            <motion.div
              className="flex items-center justify-center px-4 py-2 rounded-full"
              style={{ border: "1px solid #00FF88" }}
              animate={{ boxShadow: ["0 0 0px rgba(0,255,136,0)", "0 0 14px rgba(0,255,136,0.25)", "0 0 0px rgba(0,255,136,0)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-ts-accent font-mono text-xs font-semibold tracking-wider">
                [ AI_ORCHESTRATION_ENGINE ]
              </span>
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={heroItem}
            className="text-ts-text font-mono font-extrabold leading-[1.1] text-center max-w-[800px]"
            style={{ fontSize: "clamp(40px, 5vw, 56px)" }}
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

          {/* CTA row */}
          <motion.div variants={heroItem} className="flex items-center gap-4">
            {/* Shimmer primary button */}
            <Link
              href="/playground"
              className="relative overflow-hidden flex items-center justify-center font-mono text-sm font-bold text-ts-page px-6 py-3"
              style={{
                background: "linear-gradient(90deg, #00FF88 0%, #00cc6f 40%, #00FF88 80%, #00cc6f 100%)",
                backgroundSize: "200% auto",
                animation: "shimmer 2.5s linear infinite",
              }}
            >
              LAUNCH PLAYGROUND →
            </Link>
            <Link
              href="/docs"
              className="flex items-center justify-center font-mono text-sm font-medium text-ts-muted px-6 py-3 hover:text-ts-text hover:border-ts-text transition-colors duration-200"
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
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="flex flex-col items-center gap-6 bg-ts-surface px-16 py-16"
      >
        <motion.span variants={fadeUp} className="text-ts-accent font-mono text-xs font-bold tracking-[1.5px]">
          QUICK START
        </motion.span>
        <motion.h2 variants={clipReveal} className="text-ts-text font-mono text-3xl font-bold text-center">
          Get Started in Seconds
        </motion.h2>
        <CopyCommand text="pip install tokensense" />
        <motion.p variants={fadeUp} className="font-mono text-sm opacity-80" style={{ color: "#94A3B8" }}>
          Published to PyPI • v0.1.1 • Python 3.11+
        </motion.p>
      </motion.section>

      {/* ── Stats Ticker ───────────────────────────────────── */}
      <div
        className="flex items-center bg-ts-surface h-12 overflow-hidden"
        style={{ borderTop: "1px solid #1E1E28", borderBottom: "1px solid #1E1E28" }}
      >
        <motion.div
          className="flex items-center gap-16 whitespace-nowrap shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          ref={tickerRef}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((stat, i) => (
            <span key={i} className="text-ts-accent font-mono text-xs font-semibold shrink-0 px-4">
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
            <span className="text-ts-accent font-mono text-xs font-semibold tracking-wider">ARCHITECTURE</span>
          </div>
        </motion.div>
        <motion.h2
          variants={clipReveal}
          className="text-ts-text font-mono font-extrabold text-center"
          style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
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
        <Reveal variants={clipReveal} className="flex flex-col items-center gap-4">
          <h2
            className="font-mono font-extrabold text-center"
            style={{ color: "#34D399", fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "-1px" }}
          >
            Agent Pipeline
          </h2>
          <p className="font-mono font-medium text-center" style={{ color: "#34D399", fontSize: "16px", letterSpacing: "0.3px" }}>
            Five-stage intelligent processing system
          </p>
          <motion.div
            className="h-0.5 opacity-60"
            style={{ background: "#34D399" }}
            initial={{ width: 0 }}
            whileInView={{ width: 192 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          />
        </Reveal>

        <motion.div
          className="flex flex-col w-full max-w-[820px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
        >
          {AGENTS.map((agent, i) => (
            <motion.div key={agent.num} variants={agentItem}>
              <motion.div
                className="flex items-center gap-6 px-10 py-8 w-full relative"
                style={{ background: "rgba(52,211,153,0.03)" }}
                whileHover={{
                  background: "rgba(52,211,153,0.07)",
                  transition: { duration: 0.2 },
                }}
              >
                {/* Active left-border glow on hover */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{ background: "#34D399" }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: EASE }}
                />
                <span className="font-mono font-bold text-2xl shrink-0 w-10" style={{ color: "#34D399" }}>
                  {agent.num}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-ts-text font-mono text-base font-bold">{agent.name}</span>
                    <span
                      className="font-mono text-xs px-2 py-0.5"
                      style={{
                        color: "#34D399",
                        border: "1px solid rgba(52,211,153,0.35)",
                        background: "rgba(52,211,153,0.06)",
                      }}
                    >
                      {agent.badge}
                    </span>
                  </div>
                  <p className="text-ts-muted font-mono text-sm leading-relaxed">{agent.desc}</p>
                </div>
              </motion.div>

              {i < AGENTS.length - 1 && (
                <div className="flex items-center justify-center w-full py-1">
                  <motion.span
                    className="font-mono text-lg"
                    style={{ color: "rgba(52,211,153,0.5)" }}
                    animate={{ y: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
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
      <section className="flex flex-col items-center gap-14 bg-ts-page px-16 py-24">
        <Reveal variants={clipReveal}>
          <h2 className="text-ts-text font-mono font-extrabold text-center" style={{ fontSize: "38px", letterSpacing: "-0.5px" }}>
            THE IMPACT
          </h2>
        </Reveal>

        <motion.div
          className="flex items-stretch gap-6 w-full max-w-[1100px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18 } } }}
        >
          {IMPACT.map(({ countTo, suffix, metric, label, sub, color }) => (
            <motion.div
              key={label}
              variants={cardItem}
              className="flex-1 flex flex-col gap-3 bg-ts-surface p-8 relative overflow-hidden"
              style={{ border: `1px solid ${color}20` }}
              whileHover={{
                borderColor: `${color}60`,
                boxShadow: `0 0 30px ${color}15, 0 4px 40px rgba(0,0,0,0.4)`,
                y: -4,
                transition: { duration: 0.25 },
              }}
            >
              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
                }}
              />

              <span className="font-mono font-extrabold" style={{ color, fontSize: "52px", lineHeight: 1 }}>
                {countTo !== null ? <CountUp to={countTo} suffix={suffix ?? ""} /> : metric}
              </span>
              <span className="text-ts-text font-mono text-base font-bold">{label}</span>
              <span className="text-ts-muted font-mono text-sm leading-relaxed">{sub}</span>

              {/* Bottom progress bar animates in */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5"
                style={{ background: color, opacity: 0.4 }}
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4, ease: EASE }}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Model Routing Table ────────────────────────────── */}
      <section className="flex flex-col items-center gap-10 bg-ts-surface px-16 py-20">
        <Reveal variants={staggerContainer} className="flex flex-col items-center gap-3">
          <motion.span variants={fadeUp} className="text-ts-accent font-mono text-xs font-bold tracking-[1.5px]">
            INTELLIGENT ROUTING
          </motion.span>
          <motion.h2 variants={clipReveal} className="text-ts-text font-mono text-3xl font-bold text-center">
            Right Model for Every Query
          </motion.h2>
        </Reveal>

        <motion.div
          className="w-full max-w-[900px]"
          style={{ border: "1px solid #1E1E28" }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Header row */}
          <div
            className="grid grid-cols-4 px-6 py-3"
            style={{ background: "rgba(0,255,136,0.04)", borderBottom: "1px solid #1E1E28" }}
          >
            {["Task Type", "Context Size", "Model Selected", "Notes"].map((h) => (
              <span key={h} className="text-ts-dim font-mono text-xs font-bold tracking-wider">{h}</span>
            ))}
          </div>

          {ROUTING.map((row, i) => (
            <motion.div
              key={row.task}
              variants={rowScan}
              className="grid grid-cols-4 px-6 py-4"
              style={{
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.018)",
                borderBottom: i < ROUTING.length - 1 ? "1px solid #1E1E28" : undefined,
              }}
              whileHover={{ background: "rgba(0,255,136,0.04)", transition: { duration: 0.15 } }}
            >
              <span className="text-ts-text font-mono text-sm font-medium">{row.task}</span>
              <span className="text-ts-muted font-mono text-sm">{row.context}</span>
              <span className="text-ts-accent font-mono text-sm font-semibold">{row.model}</span>
              <span className="text-ts-dim font-mono text-sm">{row.note}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CLI Demo ──────────────────────────────────────── */}
      <section className="flex flex-col gap-12 bg-ts-page px-16 py-20">
        <Reveal variants={staggerContainer} className="flex flex-col gap-3">
          <motion.span variants={fadeUp} className="text-ts-accent font-mono text-xs font-bold tracking-[1.5px]">
            HOW IT WORKS
          </motion.span>
          <motion.h2 variants={clipReveal} className="text-ts-text font-mono text-3xl font-bold">
            Before &amp; After
          </motion.h2>
          <motion.p variants={fadeUp} className="text-ts-muted font-mono text-sm max-w-[500px] leading-relaxed">
            TokenSense intercepts your query, retrieves only the relevant context,
            compresses it, and routes to the optimal model — all in under 200ms.
          </motion.p>
        </Reveal>

        <div className="flex items-stretch gap-6 max-w-[1100px]">
          {/* Terminal — slide from left */}
          <Reveal variants={fadeLeft} className="flex-1" style={{ display: "flex", flexDirection: "column" }}>
            <div
              ref={terminalRef}
              className="flex-1 p-6 flex flex-col gap-3"
              style={{ background: "#040C08", border: "1px solid rgba(0,255,136,0.3)" }}
            >
              {/* Traffic lights */}
              <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid rgba(0,255,136,0.15)" }}>
                <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#FF6600" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
                <span className="text-ts-dim font-mono text-xs ml-2">terminal</span>
              </div>

              {/* Typewriter command line */}
              <div className="flex items-start gap-2">
                <span className="text-ts-accent font-mono text-sm shrink-0">$</span>
                <span className="font-mono text-sm leading-relaxed" style={{ color: "#E2E8F0" }}>
                  <Typewriter
                    text='tokensense ask "explain the authentication flow"'
                    triggerRef={terminalRef}
                  />
                </span>
              </div>

              {/* Output lines stagger in after command */}
              {CLI_LINES.slice(1).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.9 + i * 0.12, ease: EASE }}
                  className="flex items-start gap-2"
                >
                  <span
                    className="font-mono text-sm leading-relaxed"
                    style={{ color: line.color || "#6B6B7B" }}
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
              <span className="text-ts-muted font-mono text-xs font-bold tracking-wider">TOKEN SAVINGS</span>

              {/* Before */}
              <div className="flex flex-col items-center gap-2 w-full">
                <motion.div
                  className="flex items-center justify-center px-6 py-4 w-full"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
                  initial={{ width: "40%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <span className="text-ts-error font-mono text-2xl font-bold">
                    <CountUp to={8200} suffix="" duration={1200} />
                  </span>
                </motion.div>
                <span className="text-ts-muted font-mono text-xs">Before</span>
              </div>

              <motion.span
                className="text-ts-accent font-mono text-2xl"
                animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ↓
              </motion.span>

              {/* After */}
              <div className="flex flex-col items-center gap-2 w-full">
                <motion.div
                  className="flex items-center justify-center px-6 py-4 w-full"
                  style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" }}
                  initial={{ width: "40%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                >
                  <span className="text-ts-accent font-mono text-2xl font-bold">
                    <CountUp to={2100} suffix="" duration={1200} />
                  </span>
                </motion.div>
                <span className="text-ts-muted font-mono text-xs">After</span>
              </div>

              <motion.div
                className="flex items-center justify-center px-4 py-2 w-full"
                style={{ background: "rgba(0,255,136,0.15)", border: "1px solid #00FF88" }}
                animate={{ boxShadow: ["0 0 0px rgba(0,255,136,0)", "0 0 12px rgba(0,255,136,0.2)", "0 0 0px rgba(0,255,136,0)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <span className="text-ts-accent font-mono text-sm font-bold">-74% SAVED</span>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Demo Video ─────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-8 bg-ts-page px-16 py-20">
        <Reveal variants={staggerContainer} className="flex flex-col items-center gap-3">
          <motion.h2 variants={clipReveal} className="text-ts-text font-mono text-3xl font-bold text-center">
            SEE IT IN ACTION
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-mono font-medium text-center max-w-[600px] leading-relaxed opacity-80"
            style={{ color: "#7DD3FC", letterSpacing: "0.2px" }}
          >
            Watch how TokenSense optimizes your LLM workflow in under 2 minutes
          </motion.p>
        </Reveal>

        <Reveal variants={scaleIn}>
          <div
            className="flex flex-col items-center justify-center gap-5 w-full max-w-[960px] rounded-2xl relative overflow-hidden"
            style={{ height: "480px", background: "#0D0D12", border: "2px solid #00FF88" }}
          >
            {/* Subtle scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.012) 2px, rgba(0,255,136,0.012) 4px)",
              }}
            />
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
              style={{
                background: "radial-gradient(circle, #00FF88 0%, rgba(0,255,136,0.2) 100%)",
              }}
              whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(0,255,136,0.5)" }}
              whileTap={{ scale: 0.94 }}
              animate={{ boxShadow: ["0 0 10px rgba(0,255,136,0.2)", "0 0 25px rgba(0,255,136,0.45)", "0 0 10px rgba(0,255,136,0.2)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="text-ts-page text-2xl">▶</span>
            </motion.div>
            <span className="text-ts-muted font-mono text-base font-semibold relative z-10">
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
        <footer className="flex flex-col gap-6 px-20 py-12 bg-ts-surface" style={{ borderTop: "1px solid #1E1E28" }}>
          <div className="flex items-center justify-between">
            <span className="text-ts-accent font-mono text-base font-semibold tracking-wider">TokenSense</span>
            <div className="flex items-center gap-8">
              {[
                { label: "GitHub", href: "https://github.com" },
                { label: "Docs", href: "/docs" },
                { label: "Playground", href: "/playground" },
                { label: "API Reference", href: "/docs" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="text-ts-muted font-mono text-xs hover:text-ts-text transition-colors duration-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center pt-6" style={{ borderTop: "1px solid #1E1E28" }}>
            <span className="text-ts-dim font-mono text-xs">Built for the Hackathon · MIT License</span>
          </div>
        </footer>
      </Reveal>
    </div>
  )
}
