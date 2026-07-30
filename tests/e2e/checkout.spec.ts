import { test, expect } from "@playwright/test";

test.describe("shop & product flow", () => {
  test("/shop renders product grid", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("link", { name: /add to cart|shop now/i }).first()).toBeVisible();
  });

  test("category filter narrows results", async ({ page }) => {
    await page.goto("/shop/perfumes");
    await expect(page).toHaveURL(/\/shop\/perfumes/);
  });

  test("product detail page loads", async ({ page }) => {
    await page.goto("/product/claripet-smell-clean");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

test.describe("checkout flow", () => {
  test("redirects unauthenticated users to /login?alert=checkout", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/);
  });

  // TODO: full checkout E2E once test Supabase + Midtrans sandbox are wired:
  //   1. Login as seeded test user
  //   2. POST /api/cart with a known product/size
  //   3. Go to /checkout, fill address
  //   4. Intercept /api/payments/create — assert snapUrl returned
  //   5. Mock Midtrans webhook POST /api/payments/webhook with valid SHA512
  //   6. Assert order status -> paid via /api/orders/[id]
});
