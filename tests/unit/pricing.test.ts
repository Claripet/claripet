import { describe, it, expect } from "vitest";
import { PRODUCTS } from "@/data/products";
import {
  findSize,
  formatListPrice,
  hasPriceRange,
  priceForSize,
  priceRange,
} from "@/lib/pricing";

const salmonOil = PRODUCTS.find((p) => p.slug === "claripet-salmon-oil")!;
const smellClean = PRODUCTS.find((p) => p.slug === "claripet-smell-clean")!;
const breath = PRODUCTS.find((p) => p.slug === "claripet-breath")!;

describe("priceForSize", () => {
  it("charges each size its own price", () => {
    expect(priceForSize(salmonOil, "100ml")).toBe(55000);
    expect(priceForSize(salmonOil, "250ml")).toBe(115000);
    expect(priceForSize(smellClean, "30ml")).toBe(30000);
    expect(priceForSize(smellClean, "100ml")).toBe(59000);
  });

  // A cart row whose size was renamed or deleted in admin. Falling back to the
  // "from" price under-quotes rather than over-quotes, and checkout resolves
  // the real figure from the size row it looks up by id regardless.
  it("falls back to the from-price for an unknown size", () => {
    expect(priceForSize(salmonOil, "999ml")).toBe(salmonOil.price);
    expect(priceForSize(salmonOil, undefined)).toBe(salmonOil.price);
  });
});

describe("findSize", () => {
  it("returns the matching size row", () => {
    expect(findSize(salmonOil, "250ml")?.price).toBe(115000);
  });

  it("returns undefined for a size the product does not carry", () => {
    expect(findSize(salmonOil, "500ml")).toBeUndefined();
  });
});

describe("hasPriceRange / priceRange", () => {
  it("detects a product whose sizes differ in price", () => {
    expect(hasPriceRange(salmonOil)).toBe(true);
    expect(priceRange(salmonOil)).toEqual({ min: 55000, max: 115000 });
  });

  it("treats a single-size product as flat-priced", () => {
    expect(hasPriceRange(breath)).toBe(false);
    expect(priceRange(breath)).toEqual({ min: 45000, max: 45000 });
  });
});

describe("formatListPrice", () => {
  it("marks a multi-price product as a from-price", () => {
    expect(formatListPrice(salmonOil)).toBe("Mulai dari Rp 55.000");
  });

  it("shows a plain price when every size costs the same", () => {
    expect(formatListPrice(breath)).toBe("Rp 45.000");
  });
});

describe("catalogue invariants", () => {
  // Mirrors the DB trigger in 019_per_size_pricing.sql. If these drift, a card
  // advertises a price no size actually sells for.
  it("prices every product at its cheapest size", () => {
    for (const p of PRODUCTS) {
      expect(p.sizes.length).toBeGreaterThan(0);
      expect({ slug: p.slug, price: p.price }).toEqual({
        slug: p.slug,
        price: Math.min(...p.sizes.map((s) => s.price)),
      });
    }
  });

  it("gives every size a positive price and a label", () => {
    for (const p of PRODUCTS) {
      for (const s of p.sizes) {
        expect(s.label).toBeTruthy();
        expect(s.price).toBeGreaterThan(0);
      }
    }
  });

  it("lists sizes cheapest first, so sizes[0] is the from-size", () => {
    for (const p of PRODUCTS) {
      const prices = p.sizes.map((s) => s.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }
  });
});
