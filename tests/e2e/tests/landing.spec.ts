import { test, expect } from "@playwright/test"

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  // ── Hero ────────────────────────────────────────────────────────────────────

  test("displays the hero headline", async ({ page }) => {
    await expect(page.getByText(/Smarter Context/i)).toBeVisible()
  })

  test("displays the subheadline copy", async ({ page }) => {
    await expect(page.getByText(/72% fewer tokens/i)).toBeVisible()
  })

  test("LAUNCH PLAYGROUND CTA navigates to /playground", async ({ page }) => {
    await page.getByRole("link", { name: /launch playground/i }).click()
    await expect(page).toHaveURL(/\/playground/)
  })

  test("READ DOCS link navigates to /docs", async ({ page }) => {
    await page.getByRole("link", { name: /read docs/i }).click()
    await expect(page).toHaveURL(/\/docs/)
  })

  // ── Quick Start ─────────────────────────────────────────────────────────────

  test("quick start section is visible after scrolling", async ({ page }) => {
    await page.getByText(/pip install tokensense/i).scrollIntoViewIfNeeded()
    await expect(page.getByText(/pip install tokensense/i)).toBeVisible()
  })

  test("copy button copies the install command to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.getByText(/pip install tokensense/i).scrollIntoViewIfNeeded()

    await page.getByRole("button", { name: /copy/i }).click()

    // The button should show "Copied!" feedback
    await expect(page.getByText(/Copied!/i)).toBeVisible()

    // Check clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toBe("pip install tokensense")
  })

  test("copy feedback reverts to Copy after 2 seconds", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.getByRole("button", { name: /copy/i }).click()
    await expect(page.getByText(/Copied!/i)).toBeVisible()
    // Wait for the 2-second timeout
    await page.waitForTimeout(2200)
    await expect(page.getByRole("button", { name: /copy$/i })).toBeVisible()
  })

  // ── Stats Ticker ────────────────────────────────────────────────────────────

  test("stats ticker contains key metrics", async ({ page }) => {
    await expect(page.getByText(/AVG_REDUCTION/i)).toBeVisible()
    await expect(page.getByText(/TOKENS_PROCESSED/i)).toBeVisible()
  })

  // ── Agent Pipeline ──────────────────────────────────────────────────────────

  test("agent pipeline section is visible", async ({ page }) => {
    await page.getByText(/Agent Pipeline/i).scrollIntoViewIfNeeded()
    await expect(page.getByText(/Agent Pipeline/i)).toBeVisible()
  })

  test("all five agents are listed", async ({ page }) => {
    await page.getByText(/Query Agent/i).scrollIntoViewIfNeeded()
    await expect(page.getByText(/Query Agent/i)).toBeVisible()
    await expect(page.getByText(/Retrieval Agent/i)).toBeVisible()
    await expect(page.getByText(/Context Optimizer/i)).toBeVisible()
    await expect(page.getByText(/Routing Agent/i)).toBeVisible()
    await expect(page.getByText(/Telemetry Agent/i)).toBeVisible()
  })

  // ── Impact ──────────────────────────────────────────────────────────────────

  test("impact section is visible", async ({ page }) => {
    await page.getByText(/THE IMPACT/i).scrollIntoViewIfNeeded()
    await expect(page.getByText(/THE IMPACT/i)).toBeVisible()
    await expect(page.getByText(/Avg Token Reduction/i)).toBeVisible()
    await expect(page.getByText(/LLM Backends/i)).toBeVisible()
  })

  // ── Routing Table ───────────────────────────────────────────────────────────

  test("routing table shows all three models", async ({ page }) => {
    await page.getByText(/Claude 3 Haiku/i).scrollIntoViewIfNeeded()
    await expect(page.getByText(/Claude 3 Haiku/i)).toBeVisible()
    await expect(page.getByText(/GPT-4o Mini/i)).toBeVisible()
    await expect(page.getByText(/Gemini Pro/i)).toBeVisible()
  })

  // ── CLI Demo ────────────────────────────────────────────────────────────────

  test("before and after section is visible", async ({ page }) => {
    await page.getByText(/Before & After/i).scrollIntoViewIfNeeded()
    await expect(page.getByText(/Before & After/i)).toBeVisible()
    await expect(page.getByText(/TOKEN SAVINGS/i)).toBeVisible()
  })

  // ── Footer ──────────────────────────────────────────────────────────────────

  test("footer contains the GitHub link", async ({ page }) => {
    await page.getByRole("link", { name: /GitHub/i }).scrollIntoViewIfNeeded()
    await expect(page.getByRole("link", { name: /GitHub/i })).toBeVisible()
  })

  // ── Performance ─────────────────────────────────────────────────────────────

  test("page title is set", async ({ page }) => {
    await expect(page).toHaveTitle(/TokenSense/i)
  })

  test("page loads within 3 seconds", async ({ page }) => {
    const startTime = Date.now()
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    expect(Date.now() - startTime).toBeLessThan(3000)
  })
})
