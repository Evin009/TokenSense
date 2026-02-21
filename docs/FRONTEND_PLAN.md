# TokenSense — Frontend Build Plan

Per-page feature specifications and direct Pencil.dev design instructions.

---

## Global Design System

Apply these rules across all pages. Do not deviate per page.

| Token          | Value                    | Usage                                |
| -------------- | ------------------------ | ------------------------------------ |
| `--bg`         | `#FAFAFA`                | Page background (light mode)         |
| `--bg-dark`    | `#0A0A0A`                | Page background (dark mode)          |
| `--surface`    | `#FFFFFF`                | Card/panel backgrounds               |
| `--surface-2`  | `#F4F4F5`                | Secondary surface, alt rows          |
| `--border`     | `#E4E4E7`                | Borders, dividers                    |
| `--text`       | `#0A0A0A`                | Primary text                         |
| `--text-muted` | `#6B7280`                | Secondary text, labels               |
| `--accent`     | `#FF6600`                | CTA buttons, links, active states    |
| `--accent-dim` | `#FFF0E6`                | Accent backgrounds (pills, badges)   |
| `--code-bg`    | `#0D1117`                | Code block backgrounds               |
| `--code-green` | `#22C55E`                | Syntax / active terminal text        |
| `--red`        | `#EF4444`                | "Before" token count, error states   |
| `--green`      | `#22C55E`                | "After" token count, success states  |

**Typography:**
- Font family: Inter (import from Google Fonts)
- Headings: 700–900 weight
- Body: 400–500 weight
- Code/mono: JetBrains Mono or `font-mono`

**Layout:**
- Max content width: 1280px, centered
- Column grid: 12-column
- Gap: 16px (small), 24px (standard), 32px (section)
- Section padding: 80px vertical (landing), 48px (inner pages)

**Component conventions:**
- Buttons: 44px height, 16px horizontal padding, 4px radius
- Cards: 8px radius, `--border` stroke, 20px padding
- Input/textarea: `--code-bg` background in dark contexts, `--surface` in light
- All interactive elements: `cursor-pointer`, 150ms transition on hover

---

## Page 1: Landing Page (`/`)

### Purpose
The public face of TokenSense. Communicates the value proposition, shows how it works, and drives sign-ups / playground usage.

### Features

1. **Sticky Navbar**
   - TokenSense logo (wordmark, Inter Bold)
   - Nav links: Docs, Playground, Dashboard
   - CTA button: "Get API Key" (accent fill)
   - Transparent on scroll-top, white with shadow on scroll

2. **Hero Section**
   - Eyebrow tag: `[ AI Orchestration Engine ]` in orange monospace pill
   - H1: "Smarter Context. Better Answers. Lower Costs." (56px, weight 900)
   - Subtext: "TokenSense optimizes what goes into your LLM before the request is made — cutting token usage by up to 72% without sacrificing quality." (18px, muted)
   - Two CTAs: "Try Playground →" (orange fill) + "Read Docs" (ghost outlined)
   - Below CTAs: small social proof line — "Works with OpenRouter · Gemini · Actian VectorAI"

3. **"How It Works" Flow — 3 Steps**
   - Three cards in a horizontal row, connected by orange arrows
   - Card 1 "Index": database/file icon, "Embed your codebase into a vector DB"
   - Card 2 "Optimize": compress icon, "Retrieve only the relevant context, deduplicated and trimmed"
   - Card 3 "Route": branch icon, "Route to the best model for your task and budget"
   - Orange numbered circles (1, 2, 3) above each card

4. **Token Savings Stats Bar**
   - Full-width dark strip (`#0D1117`)
   - Three stats in white: "72% Avg Token Reduction" | "3 LLM Backends" | "<200ms Overhead"
   - Orange color on the key numbers

5. **Code Preview + Token Comparison Split**
   - Left side: dark terminal panel showing CLI command
     ```
     $ tokensense ask "explain the authentication flow"
     ✓ Indexed 142 chunks
     ✓ Context optimized: 8,200 → 2,100 tokens
     ✓ Model: claude-3-haiku (auto-selected)
     ```
   - Right side: "Before / After" token count visualizer
     - "Before" badge: 8,200 tokens (red-tinted card)
     - Orange arrow pointing right
     - "After" badge: 2,100 tokens (green-tinted card)
     - "-74% savings" label in orange

6. **Integration Logos Row**
   - Section label: "Works with your stack" (centered, muted, 14px uppercase)
   - Logo row: OpenRouter · Gemini · Actian VectorAI · Python · FastAPI

7. **Footer**
   - "TokenSense" wordmark left
   - Links right: GitHub, Docs, Playground, API Reference
   - Bottom bar: "Built for the Hackathon · MIT License"

---

### Pencil.dev Design Instructions — Landing Page

```
Design a developer-focused landing page for TokenSense, an AI context optimization engine.

STYLE: YC-inspired minimal tech aesthetic. White (#FAFAFA) background, #0A0A0A text,
#FF6600 orange accent. Inter font (weights: 400, 600, 900). Generous whitespace.
Inspired by: Linear, Vercel, Y Combinator's website. Sharp, trustworthy, technical.

SECTION 1 — NAVBAR:
Sticky top bar. White background, 1px bottom border (#E4E4E7). 64px height.
Left: "TokenSense" in Inter Bold 18px.
Center: nav links — Docs, Playground, Dashboard (14px, #6B7280, hover: #0A0A0A).
Right: "Get API Key" button — #FF6600 background, white text, 4px radius, 36px height.

SECTION 2 — HERO (full width, 160px vertical padding):
Center-aligned content, max 720px wide.
Top: pill badge — "#FF6600 background at 10% opacity, #FF6600 text" reading "[ AI Orchestration Engine ]" in 12px monospace uppercase.
H1: "Smarter Context. Better Answers. Lower Costs." — 56px, weight 900, line-height 1.1, #0A0A0A.
Subtext: 18px, #6B7280, max 560px wide, centered.
Buttons row: "Try Playground →" (orange fill, 48px tall) + 16px gap + "Read Docs" (outlined ghost, same height).
Below buttons: 24px gap, then single line of text in 13px muted: "Works with OpenRouter · Gemini · Actian VectorAI".

SECTION 3 — HOW IT WORKS (80px vertical padding, light gray #F4F4F5 background):
Section heading "How It Works" center, 32px bold.
Below: 3-column card layout, 24px gaps, max 960px wide.
Each card: white background, 8px radius, 1px border #E4E4E7, 28px padding.
  Card 1 — "Index": orange numbered circle "1" top-left, database SVG icon (24px, orange), bold title "Index", 14px gray description below.
  Card 2 — "Optimize": orange "2", compress/layers icon, "Optimize", description.
  Card 3 — "Route": orange "3", branch/fork icon, "Route", description.
Orange right-arrow icons (→) between cards, vertically centered on the card row.

SECTION 4 — STATS BAR (full width, #0D1117 background, 64px height):
Three stats side-by-side, centered, separated by 1px vertical dividers (#FFFFFF at 20% opacity).
Each stat: number in white 24px bold, label in #6B7280 14px below.
Stat 1: "72%" in #FF6600 + " Avg Token Reduction" label.
Stat 2: "3" in #FF6600 + " LLM Backends" label.
Stat 3: "<200ms" in #FF6600 + " Overhead" label.

SECTION 5 — CODE PREVIEW SPLIT (80px padding, white background, 2-column 50/50):
LEFT: dark terminal card (#0D1117 background, 8px radius, 20px padding).
  Toolbar: 3 colored dots (red/yellow/green) top-left. Tab label "tokensense" in #6B7280 12px.
  Terminal text in #22C55E monospace 13px, showing CLI output with $ prompt and 3 check lines.
RIGHT: white background, centered content.
  Label "Token Comparison" in 12px uppercase #6B7280.
  Two cards side by side connected by orange arrow →:
    Left card: #FEF2F2 background, "8,200" in #EF4444 bold 32px, "Original Tokens" label below.
    Right card: #F0FDF4 background, "2,100" in #22C55E bold 32px, "Optimized Tokens" label.
    Arrow between: → in #FF6600.
  Below both cards: "-74% savings" badge — #FFF0E6 background, #FF6600 text, 20px height pill.

SECTION 6 — INTEGRATION LOGOS (48px padding, #FAFAFA):
Centered "Works with your stack" in 12px uppercase #6B7280.
16px gap, then a horizontal row of logo chips: each is a pill with light border, icon + name.
Logos: OpenRouter, Gemini, Actian VectorAI, Python, FastAPI.

SECTION 7 — FOOTER (48px padding, white, top border #E4E4E7):
Left: "TokenSense" 16px bold.
Right: links — GitHub, Docs, Playground, API Reference (14px, #6B7280).
Second row below (centered, 12px, #9CA3AF): "Built for the Hackathon · MIT License"
```

---

## Page 2: Playground (`/playground`)

### Purpose
Interactive demo — let developers query TokenSense and see real-time token optimization in action. The core value proof.

### Features

1. **Page Header Bar**
   - Title "Playground" (24px bold)
   - Right: "API Key: ••••••" status chip + settings icon

2. **Two-Panel Layout** (fixed viewport height, no full-page scroll)
   - LEFT PANEL — Input (48% width)
   - RIGHT PANEL — Response (48% width)
   - 4px divider between panels

3. **Left Panel — "Query Input"**
   - Panel label: "QUERY INPUT" (11px, orange, uppercase, letter-spacing)
   - Large dark textarea (monospace, `#161B22` bg, green cursor, min 300px height)
   - Placeholder: "Enter a question, paste code, or describe a task..."
   - Controls row below textarea:
     - "Model" — dropdown, dark-styled, options: "Auto (Recommended)", "GPT-4o Mini", "Gemini Pro", "Claude 3 Haiku"
     - "Token Budget" — label + range slider (1000–16000, default 8000, orange track fill)
     - "Optimize Context" — toggle switch (orange when ON)
   - Run button: "Run Query →" — orange fill, full width, 48px height, white bold text

4. **Right Panel — "Response"**
   - Panel label: "RESPONSE" (11px, orange, uppercase)
   - Metadata strip — 4 mini-cards in a row:
     - "Tokens Used" (value in orange)
     - "Est. Cost" (value in orange, e.g. "$0.0012")
     - "Model" (model name)
     - "Latency" (ms in orange)
   - Large scrollable output area — dark (`#0D1117`) background, `#22C55E` text, monospace
   - Placeholder state: gray italic text "Response will appear here..."
   - Context Optimization panel at bottom (visible when Optimize toggle is ON):
     - Two stat boxes side by side: "Before: X tokens" (red) → "After: Y tokens" (green)
     - Reduction percentage badge in orange
     - Small bar showing original (red) vs optimized (orange) length

5. **Loading State**
   - Run button shows spinner while request in flight
   - Output area shows blinking cursor

---

### Pencil.dev Design Instructions — Playground

```
Design an interactive playground page for TokenSense.

STYLE: Dark-first. #0D1117 page background. Content max 1280px centered.
Navbar same as landing page (dark variant: #161B22 background).

TOP BAR (below navbar):
Full-width bar, #161B22 background, 56px height, 24px horizontal padding.
Left: "Playground" in white 20px bold.
Right: small chip — "#30363D background, #6B7280 text, 12px" reading "API Key: ••••••••" + settings icon.

MAIN CONTENT (below top bar, full viewport height remaining):
Two panels side by side, 4px gap, each with #161B22 background, 1px border #30363D.

LEFT PANEL (48% width, flex column, 20px padding):
Panel header row: "QUERY INPUT" label in #FF6600 12px uppercase left + token counter right ("0 tokens" in #6B7280 12px).
Textarea: fills remaining height, #0D1117 background, no border, #22C55E caret, 14px JetBrains Mono, #C9D1D9 text color. Placeholder in #6B7280.
Controls area at bottom (fixed, 16px padding, #0D1117 top border #30363D):
  Row 1: "Model:" label + select dropdown (#0D1117 bg, #C9D1D9 text, #30363D border, shows "Auto (Recommended)").
  Row 2: "Token Budget:" label + horizontal range slider with orange fill for used portion + value label "8,000".
  Row 3: "Optimize Context" label (left) + toggle switch (right, orange when active).
  CTA: "Run Query →" button — #FF6600 background, white text 15px bold, 48px height, full width, 6px radius.

RIGHT PANEL (48% width, flex column, 20px padding):
Panel header row: "RESPONSE" in #FF6600 12px uppercase.
Metadata row: 4 cards in a row, equal width, 8px gap.
  Each card: #0D1117 background, 1px border #30363D, 8px radius, 12px padding.
  Label: 11px #6B7280 uppercase. Value: 18px bold #FF6600.
  Values (defaults): "—" for tokens, "—" for cost, "—" for model, "—" for latency.
Response output area: fills remaining height. #0D1117 background. 14px JetBrains Mono #22C55E.
  Empty state: italic #6B7280 "Response will appear here...".
Context optimization panel (bottom, 1px top border #30363D, 16px padding):
  Label "Context Optimization" in 11px #6B7280 uppercase.
  Two stat boxes side by side + arrow:
    Box 1: #1C0000 background, "Before" label 11px gray, "8,200" in #EF4444 24px bold, "tokens" label.
    Arrow: → in #FF6600 20px.
    Box 2: #001C0C background, "After" label 11px gray, "2,100" in #22C55E 24px bold, "tokens" label.
  Below: orange pill badge "-74% saved".
```

---

## Page 3: Dashboard (`/dashboard`)

### Purpose
Analytics view of all TokenSense usage — token savings, cost, latency, model distribution. Calls `GET /stats`.

### Features

1. **Left Sidebar Navigation**
   - TokenSense logo at top
   - Nav items with icons: Overview, Playground, API Keys, Docs
   - Active state: orange left border + orange text
   - User section at bottom with avatar + name

2. **Top Bar**
   - "Analytics Overview" page title
   - Date range selector dropdown (Last 7 days, 30 days, All time)
   - "Refresh" icon button

3. **Stats Row — 4 Cards**
   - Total Queries (number + green "+12%" badge)
   - Avg Token Reduction (percentage in orange)
   - Total Cost Saved (dollar amount)
   - Avg Latency (milliseconds)

4. **Charts — First Row (60/40 split)**
   - LEFT: Line chart "Queries Over Time" — 7-day x-axis, query count y-axis, orange line, light gray grid
   - RIGHT: Donut chart "Model Distribution" — slices for each model, legend below

5. **Charts — Second Row (full width)**
   - Paired bar chart "Token Savings Per Query" — last 10 queries on x-axis
   - Blue bars = original token count, orange bars = optimized token count
   - Legend below

6. **Recent Queries Table**
   - Columns: Timestamp | Query Preview | Model | In Tokens | Out Tokens | Cost | Latency
   - Alternating row shading
   - Sortable column headers (chevron icon)
   - "View All" link at bottom right

---

### Pencil.dev Design Instructions — Dashboard

```
Design an analytics dashboard for TokenSense.

STYLE: Light mode. #FFFFFF page background. Professional SaaS feel.
Inspired by: Linear, Vercel Analytics, Stripe Dashboard.

LAYOUT: Sidebar + main content area. No top navbar (sidebar handles navigation).

SIDEBAR (240px wide, #FAFAFA background, right border 1px #E4E4E7, full height):
Top: 24px padding. "TokenSense" wordmark 16px bold + small orange square icon.
Nav section (margin-top 32px): nav items stacked 4px gap.
  Each item: 36px height, 12px horizontal padding, 12px radius.
  Icon (20px, #6B7280) + label (14px #374151).
  Items: Overview (home icon), Playground (terminal icon), API Keys (key icon), Docs (book icon).
  Active item "Overview": #FFF0E6 background, #FF6600 text + icon, 2px left border #FF6600.
Bottom (position absolute bottom 24px): avatar circle (32px) + "Evin Bento" 14px + gear icon right.

MAIN CONTENT AREA (#FFFFFF, padding 32px):

TOP BAR:
  "Analytics Overview" 24px 700 weight left.
  Right: date picker dropdown (shows "Last 7 days") + "↻ Refresh" ghost button.
  Bottom border 1px #E4E4E7. Padding-bottom 20px. Margin-bottom 24px.

STATS ROW (4 equal cards, 16px gap, margin-bottom 24px):
  Card style: white bg, 1px border #E4E4E7, 8px radius, 20px padding.
  Card 1 "Total Queries": large "1,284" in #0A0A0A 32px bold. Below: "+12% this week" in #22C55E 12px with up-arrow.
  Card 2 "Avg Token Reduction": "68%" in #FF6600 32px bold. Below: "vs unoptimized" muted.
  Card 3 "Cost Saved": "$4.27" in #22C55E 32px bold. Below: "vs full context" muted.
  Card 4 "Avg Latency": "187ms" in #0A0A0A 32px bold. Below: "end-to-end" muted.

CHARTS ROW 1 (60/40, 16px gap, margin-bottom 24px):
  LEFT CHART CARD (white, border, 8px radius, 20px padding):
    Title "Queries Over Time" 16px bold + "Last 7 days" 12px muted right.
    Area/line chart placeholder: orange line, light gray grid, 7 x-axis dates.
    Chart height: 200px.
  RIGHT CHART CARD:
    Title "Model Distribution" 16px bold.
    Donut chart (160px diameter) with 3 color segments: orange (Claude Haiku 45%), blue (GPT-4o Mini 35%), purple (Gemini Pro 20%).
    Legend below: colored dots + "Model Name — XX%" in 12px.

CHARTS ROW 2 (full width card, margin-bottom 24px):
  Title "Token Savings Per Query" 16px bold + "Last 10 queries" muted right.
  Paired bar chart: 10 query groups on x-axis.
  Each group: two bars side by side. Blue (#3B82F6) = original tokens. Orange (#FF6600) = optimized.
  Legend: colored squares + labels. Chart height 180px.

RECENT QUERIES TABLE (white card, border, 8px radius):
  Header: "Recent Queries" 16px bold left. "View All →" 14px #FF6600 right.
  Table headers: Timestamp | Query | Model | Input Tokens | Output Tokens | Cost | Latency
  Header row: 12px uppercase #6B7280, #FAFAFA background.
  5 data rows: alternating white/#FAFAFA. 14px text. Monospace for token counts.
  Each row has a "Query" column showing first 40 chars of query in italic gray.
```

---

## Page 4: Docs (`/docs`)

### Purpose
Developer reference documentation. Clean three-column layout optimized for reading and navigation. Content is markdown-rendered.

### Features

1. **Left Sidebar — Navigation**
   - Search bar at top
   - Collapsible sections: Getting Started, API Reference, CLI Commands, Agents, Integrations
   - Active item has orange left border
   - "Getting Started" expanded by default showing: Installation, Quick Start, Authentication

2. **Center Content — Main Doc Area**
   - Breadcrumb navigation at top
   - H1 title
   - Rendered markdown prose (Inter, 16px, generous line-height)
   - Code blocks: dark background, filename tab, syntax highlighting, copy button
   - Step indicators: orange numbered circles next to H2/H3 headings
   - Previous/Next navigation at bottom
   - "Edit on GitHub" link top-right

3. **Right Sidebar — Table of Contents**
   - "On this page" label
   - Section anchor links
   - Active section highlighted in orange as you scroll

4. **Content shown by default — "Quick Start" page:**
   - Installation (pip install, venv)
   - Set API Key
   - Pull and run Actian VectorAI Docker image
   - Index your first repository
   - Run your first query

---

### Pencil.dev Design Instructions — Docs

```
Design a developer documentation page for TokenSense.

STYLE: Three-column layout. Clean white center area, light sidebar backgrounds.
Inspired by: Stripe Docs, Vercel Docs, ReadMe.io. Professional, scannable, readable.

LAYOUT: Three columns — left sidebar (260px) + center content (flexible) + right TOC (200px).
No top-level navbar needed (sidebar has logo). Max content area 720px centered.

LEFT SIDEBAR (260px, #FAFAFA background, right border 1px #E4E4E7, full height):
Top: "TokenSense" logo 16px bold, 20px padding.

Search bar: "Search docs..." — light gray background (#F4F4F5), 8px radius, 36px height, magnifier icon left, 12px placeholder text. Margin 16px sides.

Nav sections (12px uppercase labels, #9CA3AF, margin-top 24px):
  SECTION "Getting Started" (expanded):
    Items shown: Installation, Quick Start (active), Authentication
    Each item: 14px, 32px height, 12px padding-left (indented).
    Active "Quick Start": 2px left border #FF6600, #FF6600 text, #FFF0E6 background.
  SECTION "API Reference" (collapsed):
    Just header visible with ▶ chevron.
  SECTION "CLI Commands" (collapsed)
  SECTION "Agents" (collapsed)
  SECTION "Integrations" (collapsed)

CENTER CONTENT (flexible, 48px horizontal padding, 32px vertical):
  Breadcrumb: "Docs / Getting Started / Quick Start" — 12px, #6B7280, with › separators.
  "Edit on GitHub ↗" link top-right, 12px #6B7280, GitHub icon.

  H1: "Quick Start Guide" — 36px, weight 900, margin-bottom 8px.
  Meta line: "5 min read · Updated Feb 2026" in 13px #9CA3AF.
  Horizontal rule.

  STEP 1 heading:
    Orange circle badge "1" (22px diameter, #FF6600 background, white number) + H2 "Install TokenSense" (20px bold) side by side.
  Prose paragraph: 16px, line-height 1.75, #374151.
  Code block:
    Container: #0D1117 background, 8px radius, overflow hidden.
    Tab bar at top: filename "bash" in 12px #6B7280, background #161B22. Copy icon (📋) right in #6B7280, hover orange.
    Code body: 14px JetBrains Mono, #C9D1D9 base color. "pip" keyword in #79C0FF. "install" in #C9D1D9. Package name in #A5D6FF.
    4px left border on entire block in #FF6600.

  STEP 2 heading: orange badge "2" + H2 "Set Your API Key".
  Prose + code block (showing export command).

  STEP 3 heading: orange badge "3" + H2 "Index Your Repository".
  Prose + code block.

  STEP 4 heading: orange badge "4" + H2 "Run Your First Query".
  Prose + CLI code block.

  BOTTOM NAV (margin-top 48px, border-top 1px #E4E4E7, padding-top 24px):
    Flex row space-between.
    Left: "← Installation" ghost link in #6B7280.
    Right: "Authentication →" orange link in #FF6600.

RIGHT TOC SIDEBAR (200px, padding 24px, no background — uses page white):
  Label: "ON THIS PAGE" — 11px, uppercase, letter-spacing 0.08em, #9CA3AF. Margin-bottom 12px.
  Anchor links (14px, #6B7280, 28px height, indented 8px for H3):
    - Installation (H2 level)
    - Set API Key (H2 level, active: #FF6600)
    - Index Repository (H2 level)
    - Your First Query (H2 level)
  Active item: #FF6600 text, 2px left border #FF6600.
  Thin 1px left border on entire list: #E4E4E7.
```

---

## Implementation Notes for Developers

### Next.js Setup Commands
```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd frontend
npx shadcn@latest init
npx shadcn@latest add button card input label slider switch select table
npm install recharts lucide-react
```

### API Client (`frontend/lib/api.ts`)

Create a typed client that:
- Reads `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`) from env
- Reads `NEXT_PUBLIC_API_KEY` from env
- Sends `X-API-Key` header on every request
- Exports typed functions: `ask()`, `optimize()`, `getStats()`, `index()`

### Environment Variables (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-tokensense-api-key
```

### Page Build Order
1. Start with Landing (`app/page.tsx`) — no API calls, pure UI
2. Then Playground (`app/playground/page.tsx`) — validates backend integration
3. Then Dashboard (`app/dashboard/page.tsx`) — needs real telemetry data
4. Then Docs (`app/docs/page.tsx`) — static content, can be done any time

### Recharts Usage
```tsx
// Line chart for Dashboard
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Donut/pie chart
import { PieChart, Pie, Cell, Legend } from 'recharts'

// Paired bar chart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
```

### Font Setup (`app/layout.tsx`)
```tsx
import { Inter } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
```

---

## Build Checklist

```
[ ] Next.js initialized with TypeScript + Tailwind + App Router
[ ] shadcn/ui initialized, base components added
[ ] recharts + lucide-react installed
[ ] frontend/lib/api.ts created with typed API client
[ ] frontend/.env.local configured
[ ] Landing page (/) — all 7 sections built
[ ] Playground (/playground) — two-panel layout + API integration
[ ] Dashboard (/dashboard) — sidebar + stats + charts + table + API integration
[ ] Docs (/docs) — three-column layout + content
[ ] CORS verified: frontend → backend requests work
[ ] Responsive check: all pages usable at 768px width minimum
```
