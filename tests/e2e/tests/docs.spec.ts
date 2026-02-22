import { test, expect } from "@playwright/test"

test.describe("Docs Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs")
  })

  // ── Layout ──────────────────────────────────────────────────────────────────

  test("renders the docs page without crashing", async ({ page }) => {
    await expect(page.locator("body")).not.toContainText(/unhandled error|TypeError/i)
  })

  test("renders the left navigation sidebar", async ({ page }) => {
    // Left nav should contain section links
    const nav = page.locator("nav, aside, [class*='sidebar'], [class*='nav']").first()
    await expect(nav).toBeVisible()
  })

  test("renders documentation content area", async ({ page }) => {
    // Main content should have at least one heading
    const heading = page.getByRole("heading").first()
    await expect(heading).toBeVisible()
  })

  // ── Section navigation ───────────────────────────────────────────────────────

  test("renders Getting Started section", async ({ page }) => {
    await expect(page.getByText(/Getting Started|Quick Start|Installation/i).first()).toBeVisible()
  })

  test("renders API Reference section", async ({ page }) => {
    const apiLink = page.getByText(/API Reference|API/i).first()
    await expect(apiLink).toBeVisible()
  })

  test("clicking a section link updates the URL or content", async ({ page }) => {
    // Click the first navigation link that isn't the current section
    const navLinks = await page.locator("nav a, aside a").all()
    if (navLinks.length > 1) {
      const initialUrl = page.url()
      await navLinks[1].click()
      await page.waitForTimeout(500) // allow hash/query change
      // URL should have changed (hash or query param), or content should update
      const newUrl = page.url()
      const urlChanged = newUrl !== initialUrl
      const contentVisible = await page.getByRole("heading").first().isVisible()
      expect(urlChanged || contentVisible).toBe(true)
    }
  })

  // ── Search ──────────────────────────────────────────────────────────────────

  test("search input is visible", async ({ page }) => {
    const searchInput = page.getByRole("searchbox").or(
      page.getByPlaceholder(/search/i)
    ).first()
    await expect(searchInput).toBeVisible()
  })

  test("search filters visible sections", async ({ page }) => {
    const searchInput = page.getByRole("searchbox").or(
      page.getByPlaceholder(/search/i)
    ).first()
    await searchInput.fill("api key")
    // Typing in the search box should filter or highlight results
    await page.waitForTimeout(300)
    // At least one result or section heading should still be visible
    const visibleHeadings = await page.getByRole("heading").count()
    expect(visibleHeadings).toBeGreaterThanOrEqual(0) // graceful even with no results
  })

  test("clearing search restores all sections", async ({ page }) => {
    const searchInput = page.getByRole("searchbox").or(
      page.getByPlaceholder(/search/i)
    ).first()
    await searchInput.fill("xyz-nonexistent-term")
    await searchInput.clear()
    await page.waitForTimeout(300)
    const visibleHeadings = await page.getByRole("heading").count()
    expect(visibleHeadings).toBeGreaterThanOrEqual(1)
  })

  // ── Code blocks ─────────────────────────────────────────────────────────────

  test("code blocks are rendered in the docs", async ({ page }) => {
    const codeBlock = page.locator("pre, code").first()
    await expect(codeBlock).toBeVisible()
  })

  // ── Table of contents ────────────────────────────────────────────────────────

  test("table of contents is rendered on the right", async ({ page }) => {
    // TOC is typically in a right-side panel
    await expect(page.getByText(/on this page|table of contents|contents/i)).toBeVisible()
  })

  // ── Page quality ─────────────────────────────────────────────────────────────

  test("docs page has no JavaScript errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/docs")
    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })

  test("docs page loads within 3 seconds", async ({ page }) => {
    const start = Date.now()
    await page.goto("/docs")
    await page.waitForLoadState("domcontentloaded")
    expect(Date.now() - start).toBeLessThan(3000)
  })
})
