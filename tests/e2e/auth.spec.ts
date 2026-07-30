import { test, expect } from "@playwright/test";

test.describe("auth flow", () => {
  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /create an account/i })).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("redirects unauthenticated users from /account to /login", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
  });

  // TODO: complete signup -> email confirm -> login -> logout flow once a
  // test Supabase project + seeded credentials are configured in CI.
  // Skeleton:
  //   await page.goto("/signup");
  //   await page.fill("[name=fullName]", "Test User");
  //   await page.fill("[name=email]", `t+${Date.now()}@example.com`);
  //   await page.fill("[name=password]", "password123");
  //   await page.click("button[type=submit]");
  //   await expect(page.getByText(/check your email/i)).toBeVisible();
});
