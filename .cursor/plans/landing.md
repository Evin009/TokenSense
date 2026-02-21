# TokenSense — Landing Page Specification (Dark Theme)

Per-page specification for the TokenSense landing page with dark, cryptic, techy aesthetic and JetBrains Mono typography.

---

## Design System

### Color Palette (Dark Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#050508` | Page background (deep black) |
| `--bg-surface` | `#0D0D12` | Cards, panels |
| `--bg-elevated` | `#16161D` | Elevated surfaces |
| `--border` | `#1E1E28` | Borders, dividers |
| `--border-dim` | `#121218` | Subtle dividers |
| `--text` | `#E4E4E7` | Primary text |
| `--text-muted` | `#6B6B7B` | Secondary text |
| `--text-dim` | `#4A4A56` | Placeholder, hints |
| `--accent` | `#00FF88` | Primary accent (terminal green) |
| `--accent-alt` | `#FF6600` | Secondary accent (orange) |
| `--terminal-cursor` | `#00FF88` | Cursor, active states |
| `--error` | `#EF4444` | Errors, "before" states |
| `--success` | `#22C55E` | Success, "after" states |

### Typography

- **Font family:** JetBrains Mono (all text)
- **Weights:** 400, 500, 600, 700, 800
- **Headings:** 700–800 weight
- **Body:** 400–500 weight
- **Labels:** Slightly increased letter-spacing for technical feel

### Layout

- Max content width: 1280px, centered
- Column grid: 12-column
- Gap: 16px (small), 24px (standard), 32px (section)
- Section padding: 80px vertical (landing)

### Visual Motifs

- Subtle scanline overlay on hero
- Terminal-style borders with green accents
- Pulsing status indicators (green dots)
- Monospace grid system

---

## Section 1: Navbar (Sticky)

- Dark background (`--bg-surface`), thin bottom border with green glow
- Height: 64px
- **Left:** "TokenSense" wordmark + small terminal icon
- **Center:** Nav links (Docs, Playground, Dashboard) — terminal-style hover with green underline
- **Right:** "Get API Key" button — green border, dark fill, green text on hover
- Transparent on scroll-top, solid with shadow on scroll

---

## Section 2: Hero

- Background: Deep black with subtle scanline overlay
- **Eyebrow:** `[ AI_ORCHESTRATION_ENGINE ]` — green bordered pill, monospace, 12px uppercase
- **H1:** "Smarter Context. Better Answers. Lower Costs." — 56px JetBrains Mono 800
- **Subtext:** "TokenSense optimizes what goes into your LLM before the request is made — cutting token usage by up to 72% without sacrificing quality." — 18px muted
- **CTAs:** "Launch Playground →" (green accent fill) + "Read Docs" (bordered ghost)
- **Social proof:** `v1.0.0 | OpenRouter · Gemini · Actian VectorAI` — 13px muted

---

## Section 3: Live Metrics Ticker

- Full-width strip below hero
- Terminal-style ticker showing simulated real-time stats:
  - `TOKENS_PROCESSED: 2,847,192`
  - `AVG_REDUCTION: 72.3%`
  - `REQUESTS_TODAY: 1,429`
- Subtle flickering animation on numbers
- Green monospace text on dark background (`--bg-surface`)
- Height: 48px

---

## Section 4: How It Works — Agent Pipeline

Replace 3-card layout with animated flow diagram:

```
[User Input]
     ↓
[Query Agent]         ← generates embeddings, classifies task
     ↓
[Retrieval Agent]     ← fetches top-k chunks from VectorAI DB
     ↓
[Context Optimizer]   ← deduplicates, compresses, enforces budget
     ↓
[Routing Agent]       ← selects optimal model
     ↓
[LLM Backend]         ← OpenRouter / Gemini
     ↓
[Telemetry Agent]     ← logs tokens, cost, latency
     ↓
[Response]
```

**Implementation:**
- ASCII-style pipeline with boxes and arrows
- Each agent box: dark surface, green border, pulsing status dot
- On hover: show brief description
- Subtle animation: data "pulse" traveling down the pipeline
- Max width 800px, centered

---

## Section 5: Agent Status Grid

- 5 agent cards in a horizontal row
- Each card: dark surface (`--bg-surface`), 1px green border, 20px padding, 8px radius
- **Cards:**
  1. `[Query]` — ● ONLINE — embedding icon
  2. `[Retrieval]` — ● ONLINE — database icon
  3. `[Optimizer]` — ● ONLINE — compress icon
  4. `[Router]` — ● ONLINE — branch icon
  5. `[Telemetry]` — ● ONLINE — chart icon
- Green pulsing dot for status
- Optional: "Last heartbeat: 247ms ago" in small muted text

---

## Section 6: CLI Typing Demo

- Full-width dark terminal (`--bg-surface`)
- Toolbar: red/yellow/green dots, tab label "tokensense"
- Simulated typing animation:

```
$ tokensense ask "refactor auth flow"
[QUERY_AGENT] embedding generated (142ms)
[RETRIEVAL] 142 chunks indexed → top-12 selected
[OPTIMIZER] 8,200 → 2,100 tokens (-74% reduction)
[ROUTER] model selected → claude-3-haiku
[RESPONSE] completed (847ms)
```

- Green monospace text (#22C55E)
- Blinking cursor
- Auto-plays once on scroll into view

---

## Section 7: Demo Video Placeholder

- **Heading:** "See TokenSense in Action" — centered, 32px
- Video container: 16:9 aspect ratio, max 960px wide, centered
- Dark border with green glow on hover
- Placeholder state: dark rectangle with play icon + "Demo video coming soon"
- Caption below: "2-minute overview of installation, indexing, and querying"

---

## Section 8: Stats Bar

- Full-width dark strip (`--bg-elevated`)
- Three stats with green accent numbers:
  - `72%` Avg Token Reduction
  - `3` LLM Backends
  - `<200ms` Overhead
- Vertical dividers in dim green
- Height: 64px

---

## Section 9: Before/After Context Comparison

- Split layout: 50/50
- **Left panel:** "Raw RAG Context" — dense text block, faded, red tint
- **Right panel:** "TokenSense Output" — clean chunks, green checkmarks
- Between: large green arrow → with "-74%" label
- Show example code/text snippets

---

## Section 10: Tech Specs Table

- **Heading:** `[ SYSTEM_SPECS ]` — terminal style, uppercase
- Monospace key-value table:

| KEY | VALUE |
|-----|-------|
| TOKEN_BUDGET | 8000 |
| EMBEDDING_MODEL | openai/text-embedding-ada-002 |
| DEFAULT_LLM | OpenRouter auto-routing |
| FALLBACK_LLM | gemini-pro |
| AUTH_HEADER | X-API-Key |
| VECTOR_DB | Actian VectorAI (port 5439) |

- Green text for values, muted gray for keys

---

## Section 11: Integration Logos

- **Label:** `[ COMPATIBLE_SYSTEMS ]` — uppercase monospace
- Logo chips: dark surface, green border on hover
- Logos: OpenRouter, Gemini, Actian VectorAI, Python, FastAPI, Docker

---

## Section 12: Footer

- Dark background (`--bg-surface`), top border with green accent
- **Left:** "TokenSense v1.0.0" + terminal icon
- **Center:** Links — GitHub, Docs, Playground, API (green hover)
- **Right:** "Built for the Hackathon · MIT License"

---

## Pencil.dev Design Instructions

```
Design a dark, cryptic, techy landing page for TokenSense, an AI orchestration engine.

STYLE: Terminal/hacker aesthetic. Deep black (#050508) background, #E4E4E7 text,
#00FF88 green accent. JetBrains Mono font everywhere (weights 400–800). 
Subtle scanlines, pulsing status indicators, monospace grid. Cryptic but readable.

SECTION 1 — NAVBAR:
Sticky, #0D0D12 background, 1px bottom border #00FF88 at 30% opacity. 64px height.
Left: "TokenSense" JetBrains Mono 18px 700 + terminal icon.
Center: Docs, Playground, Dashboard — 14px, #6B6B7B, hover green underline.
Right: "Get API Key" — 1px green border, dark fill, 36px height.

SECTION 2 — HERO (160px vertical padding):
#050508 background, subtle horizontal scanlines 2% opacity.
Eyebrow pill: [ AI_ORCHESTRATION_ENGINE ] — green border, 12px monospace.
H1: "Smarter Context. Better Answers. Lower Costs." — 56px 800, #E4E4E7.
Subtext: 18px #6B6B7B, max 560px centered.
CTAs: "Launch Playground →" green fill + "Read Docs" bordered.
Below: v1.0.0 | OpenRouter · Gemini · Actian VectorAI in 13px muted.

SECTION 3 — METRICS TICKER (48px height, #0D0D12):
Three stats in monospace: TOKENS_PROCESSED, AVG_REDUCTION, REQUESTS_TODAY.
Values in #00FF88, labels muted. Flicker effect on numbers.

SECTION 4 — AGENT PIPELINE:
Vertical flow: User Input → Query Agent → Retrieval → Optimizer → Router → LLM → Telemetry → Response.
Each box: dark surface, green border, pulsing dot. Arrows between.
Max 800px wide, centered.

SECTION 5 — AGENT STATUS GRID:
5 cards in row. Each: icon + name + ● ONLINE. Green pulsing dots.
Cards: Query, Retrieval, Optimizer, Router, Telemetry.

SECTION 6 — CLI DEMO:
Terminal panel #0D0D12. Red/yellow/green dots. Green monospace output.
$ tokensense ask "refactor auth flow" + agent log lines.
Blinking cursor.

SECTION 7 — DEMO VIDEO:
16:9 placeholder, max 960px. Dark border, play icon center.
"Demo video coming soon" text.

SECTION 8 — STATS BAR (64px, #16161D):
72% | 3 | <200ms with labels. Green numbers.

SECTION 9 — CONTEXT COMPARISON:
Left: Raw RAG (red tint, dense). Right: Optimized (green checks).
Arrow between with -74%.

SECTION 10 — TECH SPECS:
[ SYSTEM_SPECS ] heading. Key-value table, monospace.

SECTION 11 — INTEGRATIONS:
[ COMPATIBLE_SYSTEMS ]. Logo chips with green hover.

SECTION 12 — FOOTER:
TokenSense v1.0.0 | links | MIT License. Top border green.
```

---

## Implementation Notes

### Font Setup (Next.js)

```tsx
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700', '800']
})
```

Apply `--font-jetbrains-mono` to `body` in `layout.tsx` for global use.

### Animation Suggestions

- **Metrics ticker:** `opacity` or `filter` subtle flicker (CSS animation)
- **Status dots:** `animation: pulse 2s infinite`
- **CLI typing:** Intersection Observer + character-by-character reveal
- **Pipeline pulse:** SVG stroke-dashoffset or gradient animation
