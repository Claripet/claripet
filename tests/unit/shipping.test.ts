import { describe, it, expect } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_PACKAGE_WEIGHT_GRAMS,
  ALLOWED_COURIERS,
  SHIPPING_ORIGIN,
} from "@/lib/shipping";

describe("shipping constants", () => {
  it("exposes the free-shipping threshold", () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(250000);
  });

  it("defaults package weight to 1000g", () => {
    expect(DEFAULT_PACKAGE_WEIGHT_GRAMS).toBe(1000);
  });

  it("ships from Jakarta", () => {
    expect(SHIPPING_ORIGIN).toBe("Jakarta");
  });

  it("only allows JNE, J&T, SiCepat", () => {
    expect(ALLOWED_COURIERS).toEqual(["jne", "jnt", "sicepat"]);
  });
});

// TODO: normalizeCourierCode — not exported; consider exporting for testability.
// Cases to cover once exported:
//   ("jne", "JNE Express") -> "jne"
//   ("jnt", "J&T Express") -> "jnt"
//   ("jet", "J&T Express") -> "jnt"   // common misspelling
//   ("sicepat", "SiCepat")   -> "sicepat"
//   ("j&t", "J&T")           -> "jnt"

// TODO: isRegularService — not exported; consider exporting.
// Cases:
//   ("jne", "REG")     -> true
//   ("jne", "YES")     -> false
//   ("jnt", "EZ")      -> true
//   ("jnt", "REG")     -> true
//   ("sicepat", "REG") -> true
//   ("sicepat", "HALU")-> false

// TODO: getShippingRates — requires mocking global fetch.
// Use vi.stubGlobal("fetch", vi.fn()) + a RajaOngkir-shaped response.
// Assert:
//   - throws when province is empty
//   - freeShipping zeroes fee when subtotal >= 250000
//   - weight floors to 1g via Math.max(weight, 1)
//   - filters out non-allowed couriers
//   - keeps only cheapest regular service per courier
//   - throws "Tidak ada layanan..." when no rates match
