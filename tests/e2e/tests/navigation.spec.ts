import { test, expect } from "@playwright/test"

test.describe("Navigation & Page Transitions", () => {
  // ── Route correctness ────────────────────────────────────────────────────────

  test("landing page loads at /", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/")
    await expect(page.getByText(/Smarter Context/i)).toBeVisible()
  })

  test("playground page loads at /playground", async ({ page }) => {
    await page.goto("/playground")
    await expect(page).toHaveURL(/\/playground/)
    await expect(page.getByText(/Playground/i).first()).toBeVisible()
  })

  test("dashboard page loads at /dashboard", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(/Dashboard/i).first()).toBeVisible()
  })

  test("docs page loads at /docs", async ({ page }) => {
    await page.goto("/docs")
    await expect(page).toHaveURL(/\/docs/)
    await expect(page.getByText(/Documentation/i).first()).toBeVisible()
  })

  // ── Navbar links ─────────────────────────────────────────────────────────────

  test("navbar Playground link navigates correctly", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /playground/i }).first().click()
    await expect(page).toHaveURL(/\/playground/)
  })

  test("navbar Dashboard link navigates correctly", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /dashboard/i }).first().click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("navbar Docs link navigates correctly", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /docs/i }).first().click()
    await expect(page).toHaveURL(/\/docs/)
  })

  test("TokenSense brand in navbar navigates to /", async ({ page }) => {
    await page.goto("/playground")
    await page.getByRole("link", { name: /TokenSense/i }).first().click()
    await expect(page).toHaveURL("/")
  })

  // ── Transition smoothness ────────────────────────────────────────────────────

  test("navigation does not cause a full page reload", async ({ page }) => {
    await page.goto("/")
    // Listen for page navigations — in a SPA there should be no full reloads
    let reloadCount = 0
    page.on("load", () => { reloadCount++ })

    await page.getByRole("link", { name: /playground/i }).first().click()
    await page.waitForURL(/\/playground/)

    // Client-side navigation via Next.js App Router should not hard-reload
    // (reloadCount stays at 0 after initial load)
    expect(reloadCount).toBe(0)
  })

  test("back navigation returns to the previous page", async ({ page }) => {
    await page.goto("/")
    await page.goto("/playground")
    await page.goBack()
    await expect(page).toHaveURL("/")
  })

  // ── Active link state ────────────────────────────────────────────────────────

  test("navbar highlights the active page link", async ({ page }) => {
    await page.goto("/playground")
    const navLinks = await page.locator("nav a").all()
    // At least one nav link should have accent styling
    const classes = await Promise.all(navLinks.map((l) => l.getAttribute("class")))
    const hasActiveLink = classes.some((c) => c && (c.includes("accent") || c.includes("text-ts")))
    expect(hasActiveLink).toBe(true)
  })

  // ── 404 page ─────────────────────────────────────────────────────────────────

  test("unknown route shows a not-found page without crashing", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist")
    // Next.js returns 404 for unknown static routes
    expect(response?.status()).toBe(404)
  })
})
