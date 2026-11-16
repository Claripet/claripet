import { describe, it, expect } from "vitest";
import { getClientIp } from "@/lib/helpers/clientIp";
import { canTransition, ADMIN_TRANSITIONS } from "@/lib/orderStatus";
import { computeCartTotals, PACKAGING_WEIGHT_GRAMS, FALLBACK_ITEM_WEIGHT_GRAMS } from "@/lib/cartTotals";
import { pickRate, type ShippingRate } from "@/lib/shipping";
import { updateOrderStatusSchema, createOrderSchema } from "@/lib/validators/order";
import { shippingQuoteSchema } from "@/lib/validators/shipping";

function req(headers: Record<string, string>) {
  return new Request("https://claripetcare.com/api/x", { headers });
}

describe("getClientIp", () => {
  it("uses cf-connecting-ip", () => {
    expect(getClientIp(req({ "cf-connecting-ip": "198.51.100.7" }))).toBe("198.51.100.7");
  });

  it("ignores a client-supplied x-forwarded-for", () => {
    expect(
      getClientIp(req({ "cf-connecting-ip": "198.51.100.7", "x-forwarded-for": "203.0.113.1" })),
    ).toBe("198.51.100.7");
    expect(getClientIp(req({ "x-forwarded-for": "203.0.113.1" }))).toBe("unknown");
  });
});

describe("admin order transitions", () => {
  it("allows the normal fulfilment path", () => {
    expect(canTransition("pending", "paid")).toBe(true);
    expect(canTransition("paid", "processing")).toBe(true);
    expect(canTransition("processing", "shipped")).toBe(true);
    expect(canTransition("paid", "shipped")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(true);
  });

  it("never moves backwards or out of a final state", () => {
    expect(canTransition("cancelled", "paid")).toBe(false);
    expect(canTransition("shipped", "paid")).toBe(false);
    expect(canTransition("shipped", "cancelled")).toBe(false);
    expect(canTransition("delivered", "pending")).toBe(false);
    expect(ADMIN_TRANSITIONS.delivered).toEqual([]);
    expect(ADMIN_TRANSITIONS.cancelled).toEqual([]);
  });
});

describe("computeCartTotals", () => {
  it("sums price and weight per unit and adds packaging once", () => {
    const t = computeCartTotals([
      { qty: 2, price: 59000, weightGrams: 160 },
      { qty: 1, price: 115000, weightGrams: 310 },
    ]);
    expect(t.itemCount).toBe(3);
    expect(t.subtotal).toBe(233000);
    expect(t.weightGrams).toBe(2 * 160 + 310 + PACKAGING_WEIGHT_GRAMS);
  });

  it("falls back to a default weight for a size without one", () => {
    const t = computeCartTotals([{ qty: 1, price: 1000, weightGrams: null }]);
    expect(t.weightGrams).toBe(FALLBACK_ITEM_WEIGHT_GRAMS + PACKAGING_WEIGHT_GRAMS);
  });

  it("is zero for an empty cart", () => {
    expect(computeCartTotals([])).toEqual({ itemCount: 0, subtotal: 0, weightGrams: 0 });
  });
});

describe("pickRate", () => {
  const rate = (courierCode: string, courierServiceCode: string, fee: number): ShippingRate => ({
    courierCode,
    courierName: courierCode,
    courierServiceCode,
    courierServiceName: courierServiceCode,
    description: "",
    etd: "",
    fee,
    originalFee: fee,
    freeShipping: false,
  });
  const rates = [rate("jne", "REG", 20000), rate("jnt", "EZ", 18000)];

  it("returns the chosen courier", () => {
    expect(pickRate(rates, "jnt", "EZ")?.fee).toBe(18000);
  });

  it("returns null instead of silently switching courier", () => {
    expect(pickRate(rates, "sicepat", "REG")).toBeNull();
    expect(pickRate(rates, "jne", "YES")).toBeNull();
  });
});

describe("order validators", () => {
  it("requires a courier when creating an order", () => {
    expect(
      createOrderSchema.safeParse({ shipping_address_id: "00000000-0000-4000-8000-000000000000" }).success,
    ).toBe(false);
  });

  it("accepts a resi-only admin update", () => {
    const r = updateOrderStatusSchema.safeParse({ tracking_number: "jp1234567890" });
    expect(r.success).toBe(true);
  });

  it("rejects an empty admin update and a resi with spaces or symbols", () => {
    expect(updateOrderStatusSchema.safeParse({}).success).toBe(false);
    expect(updateOrderStatusSchema.safeParse({ tracking_number: "JP 123 456" }).success).toBe(false);
    expect(updateOrderStatusSchema.safeParse({ tracking_number: "<script>" }).success).toBe(false);
  });

  it("strips client-supplied subtotal and weight from a shipping quote", () => {
    const r = shippingQuoteSchema.parse({ province: "DKI Jakarta", subtotal: 999999999, weightGrams: 1 });
    expect(r).toEqual({ province: "DKI Jakarta" });
  });
});
