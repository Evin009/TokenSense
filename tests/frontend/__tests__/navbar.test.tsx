/**
 * Tests for src/components/navbar.tsx
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { usePathname } from "next/navigation"

// Mock next/navigation before importing the component
jest.mock("next/navigation")

import { Navbar } from "@/components/navbar"

const mockUsePathname = usePathname as jest.Mock

// ── Rendering ─────────────────────────────────────────────────────────────────

describe("Navbar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/")
  })

  it("renders the TokenSense brand name", () => {
    render(<Navbar />)
    expect(screen.getByText(/TokenSense/i)).toBeInTheDocument()
  })

  it("renders all four navigation links", () => {
    render(<Navbar />)
    expect(screen.getByRole("link", { name: /playground/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /docs/i })).toBeInTheDocument()
  })

  it("playground link points to /playground", () => {
    render(<Navbar />)
    const link = screen.getByRole("link", { name: /playground/i })
    expect(link).toHaveAttribute("href", "/playground")
  })

  it("dashboard link points to /dashboard", () => {
    render(<Navbar />)
    const link = screen.getByRole("link", { name: /dashboard/i })
    expect(link).toHaveAttribute("href", "/dashboard")
  })

  it("docs link points to /docs", () => {
    render(<Navbar />)
    const link = screen.getByRole("link", { name: /docs/i })
    expect(link).toHaveAttribute("href", "/docs")
  })
})

// ── Active link highlighting ──────────────────────────────────────────────────

describe("Navbar active state", () => {
  it("highlights the playground link when on /playground", () => {
    mockUsePathname.mockReturnValue("/playground")
    render(<Navbar />)
    const activeLink = screen.getByRole("link", { name: /playground/i })
    // Active links have text-ts-accent or similar — check the class contains an accent indicator
    expect(activeLink.className).toMatch(/accent|active|text-ts/i)
  })

  it("highlights the dashboard link when on /dashboard", () => {
    mockUsePathname.mockReturnValue("/dashboard")
    render(<Navbar />)
    const activeLink = screen.getByRole("link", { name: /dashboard/i })
    expect(activeLink.className).toMatch(/accent|active|text-ts/i)
  })

  it("does not highlight playground when on /dashboard", () => {
    mockUsePathname.mockReturnValue("/dashboard")
    render(<Navbar />)
    // Playground link should NOT have the active accent class
    const playgroundLink = screen.getByRole("link", { name: /playground/i })
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
    expect(dashboardLink.className).not.toBe(playgroundLink.className)
  })
})
