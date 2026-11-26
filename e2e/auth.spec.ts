import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })

  test("shows login form", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test("logs in with valid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill("admin@example.com")
    await page.getByLabel(/password/i).fill("Admin@123")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill("wrong@example.com")
    await page.getByLabel(/password/i).fill("wrongpass")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })
})

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill("admin@example.com")
    await page.getByLabel(/password/i).fill("Admin@123")
    await page.getByRole("button", { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/)
  })

  test("shows stats cards", async ({ page }) => {
    await expect(page.getByText(/total forms/i)).toBeVisible()
    await expect(page.getByText(/total submissions/i)).toBeVisible()
  })

  test("navigates to forms page", async ({ page }) => {
    await page.getByRole("link", { name: /forms/i }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/forms/)
  })
})

test.describe("Public Form", () => {
  test("renders published form", async ({ page }) => {
    await page.goto("/forms/bmw-sg/ix3-test-drive")
    await expect(page.getByText(/BMW iX3 Test Drive/i)).toBeVisible()
  })
})
