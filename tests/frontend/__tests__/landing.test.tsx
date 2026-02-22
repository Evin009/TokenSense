/**
 * Tests for src/app/page.tsx — Landing page sections and interactions.
 *
 * Heavy dependencies (framer-motion, canvas, cursor glow) are mocked so
 * tests focus on content and behaviour, not animation internals.
 */

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}))

// Replace framer-motion with pass-through React elements
jest.mock("framer-motion", () => {
  const React = require("react") as typeof import("react")
  const motion = new Proxy({} as Record<string, React.FC>, {
    get: (_, tag: string) =>
      // eslint-disable-next-line react/display-name
      ({ children, animate, initial, whileInView, whileHover, whileTap, transition, variants, viewport, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) =>
        React.createElement(tag as keyof JSX.IntrinsicElements, rest, children),
  })
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useInView: () => true,
  }
})

jest.mock("@/components/hero-bg", () => ({ HeroBg: () => null }))
jest.mock("@/components/cursor-glow", () => ({ CursorGlow: () => null }))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
})

import LandingPage from "@/app/page"

// ── Hero section ──────────────────────────────────────────────────────────────

describe("LandingPage — Hero", () => {
  it("renders the main headline", () => {
    render(<LandingPage />)
    expect(screen.getByText(/Smarter Context/i)).toBeInTheDocument()
  })

  it("renders the subheadline copy", () => {
    render(<LandingPage />)
    expect(screen.getByText(/72% fewer tokens/i)).toBeInTheDocument()
  })

  it("renders the LAUNCH PLAYGROUND CTA", () => {
    render(<LandingPage />)
    const cta = screen.getByRole("link", { name: /launch playground/i })
    expect(cta).toBeInTheDocument()
    expect(cta).toHaveAttribute("href", "/playground")
  })

  it("renders the READ DOCS link", () => {
    render(<LandingPage />)
    const docsLink = screen.getByRole("link", { name: /read docs/i })
    expect(docsLink).toHaveAttribute("href", "/docs")
  })

  it("renders the version badge", () => {
    render(<LandingPage />)
    expect(screen.getByText(/v1\.0\.0/i)).toBeInTheDocument()
  })
})

// ── Quick Start section ───────────────────────────────────────────────────────

describe("LandingPage — Quick Start", () => {
  it("renders the install command", () => {
    render(<LandingPage />)
    expect(screen.getByText(/pip install tokensense/i)).toBeInTheDocument()
  })

  it("renders a copy button", () => {
    render(<LandingPage />)
    const copyBtn = screen.getByRole("button", { name: /copy/i })
    expect(copyBtn).toBeInTheDocument()
  })

  it("copies text to clipboard on click", async () => {
    render(<LandingPage />)
    const copyBtn = screen.getByRole("button", { name: /copy/i })
    await userEvent.click(copyBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("pip install tokensense")
  })

  it("shows 'Copied!' feedback after clicking copy", async () => {
    render(<LandingPage />)
    const copyBtn = screen.getByRole("button", { name: /copy/i })
    await userEvent.click(copyBtn)
    await waitFor(() => {
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument()
    })
  })
})

// ── Agent Pipeline section ────────────────────────────────────────────────────

describe("LandingPage — Agent Pipeline", () => {
  it("renders the section heading", () => {
    render(<LandingPage />)
    expect(screen.getByText(/Agent Pipeline/i)).toBeInTheDocument()
  })

  it("renders all five agents", () => {
    render(<LandingPage />)
    expect(screen.getByText(/Query Agent/i)).toBeInTheDocument()
    expect(screen.getByText(/Retrieval Agent/i)).toBeInTheDocument()
    expect(screen.getByText(/Context Optimizer/i)).toBeInTheDocument()
    expect(screen.getByText(/Routing Agent/i)).toBeInTheDocument()
    expect(screen.getByText(/Telemetry Agent/i)).toBeInTheDocument()
  })

  it("renders agent sequence numbers", () => {
    render(<LandingPage />)
    expect(screen.getByText("01")).toBeInTheDocument()
    expect(screen.getByText("05")).toBeInTheDocument()
  })
})

// ── Impact section ────────────────────────────────────────────────────────────

describe("LandingPage — Impact", () => {
  it("renders THE IMPACT heading", () => {
    render(<LandingPage />)
    expect(screen.getByText(/THE IMPACT/i)).toBeInTheDocument()
  })

  it("renders impact metric labels", () => {
    render(<LandingPage />)
    expect(screen.getByText(/Avg Token Reduction/i)).toBeInTheDocument()
    expect(screen.getByText(/Pipeline Overhead/i)).toBeInTheDocument()
    expect(screen.getByText(/LLM Backends/i)).toBeInTheDocument()
  })
})

// ── Model Routing Table ───────────────────────────────────────────────────────

describe("LandingPage — Routing Table", () => {
  it("renders the routing section heading", () => {
    render(<LandingPage />)
    expect(screen.getByText(/Right Model for Every Query/i)).toBeInTheDocument()
  })

  it("renders all three model names", () => {
    render(<LandingPage />)
    expect(screen.getByText(/Claude 3 Haiku/i)).toBeInTheDocument()
    expect(screen.getByText(/GPT-4o Mini/i)).toBeInTheDocument()
    expect(screen.getByText(/Gemini Pro/i)).toBeInTheDocument()
  })
})

// ── CLI Demo section ──────────────────────────────────────────────────────────

describe("LandingPage — CLI Demo", () => {
  it("renders the Before & After heading", () => {
    render(<LandingPage />)
    expect(screen.getByText(/Before & After/i)).toBeInTheDocument()
  })

  it("renders the TOKEN SAVINGS label", () => {
    render(<LandingPage />)
    expect(screen.getByText(/TOKEN SAVINGS/i)).toBeInTheDocument()
  })
})

// ── Footer ────────────────────────────────────────────────────────────────────

describe("LandingPage — Footer", () => {
  it("renders the TokenSense brand in the footer", () => {
    render(<LandingPage />)
    // There should be multiple "TokenSense" occurrences (nav + footer)
    const elements = screen.getAllByText(/TokenSense/i)
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it("renders GitHub and API Reference footer links", () => {
    render(<LandingPage />)
    expect(screen.getByRole("link", { name: /GitHub/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /API Reference/i })).toBeInTheDocument()
  })
})
