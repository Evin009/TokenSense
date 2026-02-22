# TokenSense Frontend

Premium landing page for TokenSense AI Orchestration Engine.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Typography:** JetBrains Mono (via next/font/google)
- **Language:** TypeScript

## Design System

### Colors (Dark Terminal Theme)

```css
--bg-page: #050508       /* Deep black canvas */
--bg-surface: #0D0D12    /* Card/panel backgrounds */
--bg-elevated: #16161D   /* Elevated surfaces */
--border: #1E1E28        /* Borders, dividers */
--border-dim: #121218    /* Subtle dividers */

--text: #E4E4E7          /* Primary text */
--text-muted: #6B6B7B    /* Secondary text */
--text-dim: #4A4A56      /* Placeholder, hints */

--accent: #00FF88        /* Primary accent (terminal green) */
--accent-alt: #FF6600    /* Secondary accent (orange) */

--success: #22C55E       /* Success states */
--error: #EF4444         /* Error states */
--info: #3B82F6          /* Info states */
```

### Typography

- **Font:** JetBrains Mono (all weights: 400, 500, 600, 700, 800)
- **Headings:** 700–800 weight
- **Body:** 400–500 weight
- **Labels:** Uppercase with increased letter-spacing

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx          # Root layout with JetBrains Mono
│       ├── page.tsx            # Landing page (to be implemented)
│       └── globals.css         # Global styles
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## Landing Page Sections

1. **Navbar** - Sticky navigation with green accent border
2. **Hero** - Cryptic headline with AI orchestration engine badge
3. **Metrics Ticker** - Real-time stats display
4. **Agent Pipeline** - Visual flow of the 5-agent system
5. **Agent Status Grid** - 5 cards showing online status
6. **CLI Demo** - Terminal-style output simulation
7. **Stats Bar** - Token reduction, backends, overhead metrics
8. **Before/After Comparison** - Visual token savings
9. **System Specs** - Technical specifications table
10. **Integrations** - Compatible systems chips
11. **Footer** - Links and branding

## Design Reference

The visual design is available in `/design.pen` - a dark, terminal-aesthetic landing page with:
- Terminal green (#00FF88) accent color
- Monospace typography throughout
- Sharp corners (0px radius)
- Pulsing status indicators
- ASCII-style pipeline visualization
- Code-first aesthetic

## Notes

- All sections use JetBrains Mono exclusively
- No rounded corners (0px radius)
- Minimal shadows
- Green accent for active states and CTAs
- Dark mode only (no light theme)
