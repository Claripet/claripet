import { describe, it, expect } from "vitest";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validators/cart";
import { signupSchema, loginSchema, updateProfileSchema } from "@/lib/validators/auth";
import { createProductSchema, updateProductSchema, patchProductSchema } from "@/lib/validators/product";

const uuid = () => crypto.randomUUID();

describe("addToCartSchema", () => {
  it("accepts a valid payload", () => {
    expect(
      addToCartSchema.parse({ product_id: uuid(), size_id: uuid(), qty: 2 }).qty,
    ).toBe(2);
  });

  it("defaults qty to 1", () => {
    expect(
      addToCartSchema.parse({ product_id: uuid(), size_id: uuid() }).qty,
    ).toBe(1);
  });

  it("rejects qty=0", () => {
    expect(
      addToCartSchema.safeParse({ product_id: uuid(), size_id: uuid(), qty: 0 }).success,
    ).toBe(false);
  });

  it("rejects qty > 99", () => {
    expect(
      addToCartSchema.safeParse({ product_id: uuid(), size_id: uuid(), qty: 100 }).success,
    ).toBe(false);
  });

  it("rejects non-uuid product_id", () => {
    expect(
      addToCartSchema.safeParse({ product_id: "x", size_id: uuid(), qty: 1 }).success,
    ).toBe(false);
  });
});

describe("updateCartItemSchema", () => {
  it("accepts valid qty", () => {
    expect(updateCartItemSchema.parse({ qty: 5 }).qty).toBe(5);
  });

  it("rejects qty < 1", () => {
    expect(updateCartItemSchema.safeParse({ qty: 0 }).success).toBe(false);
  });

  it("rejects qty > 99", () => {
    expect(updateCartItemSchema.safeParse({ qty: 100 }).success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts a valid signup", () => {
    expect(
      signupSchema.safeParse({ email: "a@b.com", password: "password123", full_name: "Test" }).success,
    ).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      signupSchema.safeParse({ email: "not-an-email", password: "password123", full_name: "Test" }).success,
    ).toBe(false);
  });

  it("rejects password < 8 chars", () => {
    expect(
      signupSchema.safeParse({ email: "a@b.com", password: "short", full_name: "Test" }).success,
    ).toBe(false);
  });

  it("rejects empty full_name", () => {
    expect(
      signupSchema.safeParse({ email: "a@b.com", password: "password123", full_name: "" }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "anything" }).success).toBe(true);
  });

  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("accepts partial updates", () => {
    expect(updateProfileSchema.safeParse({ full_name: "New Name" }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ phone: "+6281234567890" }).success).toBe(true);
  });

  it("rejects full_name over 100 chars", () => {
    expect(
      updateProfileSchema.safeParse({ full_name: "x".repeat(101) }).success,
    ).toBe(false);
  });
});

describe("patchProductSchema (mass-assignment guard)", () => {
  it("accepts status-only update", () => {
    expect(patchProductSchema.safeParse({ status: "archived" }).success).toBe(true);
  });

  it("accepts price update", () => {
    expect(patchProductSchema.safeParse({ price: 150000 }).success).toBe(true);
  });

  it("REJECTS slug (immutable via PATCH)", () => {
    expect(
      patchProductSchema.safeParse({ slug: "tampered-slug" }).success,
    ).toBe(false);
  });

  it("REJECTS category_id (immutable via PATCH)", () => {
    expect(
      patchProductSchema.safeParse({ category_id: uuid() }).success,
    ).toBe(false);
  });

  it("REJECTS sizes array (managed by PUT)", () => {
    expect(
      patchProductSchema.safeParse({ sizes: [{ label: "100ml", stock: 10 }] }).success,
    ).toBe(false);
  });

  it("REJECTS images array (managed by PUT)", () => {
    expect(
      patchProductSchema.safeParse({ images: [{ url: "https://x/y.png" }] }).success,
    ).toBe(false);
  });
});

describe("createProductSchema", () => {
  const valid = {
    slug: "claripet-test",
    name: "Test Product",
    category_id: uuid(),
    price: 99000,
    sizes: [{ label: "100ml", stock: 10 }],
  };

  it("accepts a valid product", () => {
    expect(createProductSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects slug with uppercase", () => {
    expect(createProductSchema.safeParse({ ...valid, slug: "UPPER" }).success).toBe(false);
  });

  it("rejects negative price", () => {
    expect(createProductSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
  });

  it("rejects empty sizes array", () => {
    expect(createProductSchema.safeParse({ ...valid, sizes: [] }).success).toBe(false);
  });
});
