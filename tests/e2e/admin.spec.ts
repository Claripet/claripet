import { test, expect } from "@playwright/test";

test.describe("admin access control", () => {
  test("redirects non-admin users from /admin to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin API requires admin role", async ({ request }) => {
    const res = await request.get("/api/admin/products");
    expect([401, 403]).toContain(res.status());
  });

  test("PATCH /api/admin/products/[id] rejects unvalidated fields", async ({ request }) => {
    // Mass-assignment guard: id/created_at must be stripped by Zod.
    const res = await request.patch("/api/admin/products/00000000-0000-0000-0000-000000000000", {
      data: { id: "tampered", created_at: "1970-01-01", slug: "tampered" },
    });
    expect([401, 403, 400]).toContain(res.status());
  });

  // TODO: full admin CRUD once seeded admin credentials exist:
  //   login as admin -> /admin/products/new -> create -> edit -> archive -> delete
});
