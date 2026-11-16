import { describe, it, expect, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: () => { throw new Error("no ctx"); } }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => { throw new Error("not used"); } }));

import { buildOrderEmail, rupiah, shortOrderNo, type OrderEmailData } from "@/lib/email/orderEmails";

const order: OrderEmailData = {
  id: "3f2a9c1e-0000-4000-8000-000000000000",
  subtotal: 118000,
  shipping_fee: 0,
  total: 118000,
  shipping_address: {
    full_name: "<b>Budi</b>",
    phone: "08123",
    street: "Jl. Mawar 1",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postal_code: "12345",
  },
  courier_code: "jne",
  courier_service: "REG",
  shipping_etd: "2-3",
  tracking_number: "JP1234567890",
  items: [{ product_name: "Shampoo & Co", size_label: "250ml", qty: 2, unit_price: 59000 }],
};

describe("order emails", () => {
  it("formats rupiah and the short order number", () => {
    expect(rupiah(118000)).toBe("Rp118.000");
    expect(shortOrderNo(order.id)).toBe("3F2A9C1E");
  });

  it("builds the paid email with totals and free shipping", () => {
    const m = buildOrderEmail("paid", order, "Budi");
    expect(m.subject).toBe("Pembayaran diterima, pesanan #3F2A9C1E");
    expect(m.text).toContain("Ongkir: Gratis");
    expect(m.text).toContain("Total: Rp118.000");
    expect(m.text).not.toContain("JP1234567890");
  });

  it("puts the resi in the shipped email", () => {
    const m = buildOrderEmail("shipped", order, "Budi");
    expect(m.subject).toBe("Pesanan #3F2A9C1E sudah dikirim");
    expect(m.text).toContain("No. resi: JP1234567890");
    expect(m.html).toContain("JP1234567890");
  });

  it("escapes customer-controlled text in the html", () => {
    const m = buildOrderEmail("paid", order, "<script>x</script>");
    expect(m.html).not.toContain("<script>");
    expect(m.html).not.toContain("<b>Budi</b>");
    expect(m.html).toContain("&lt;b&gt;Budi&lt;/b&gt;");
    expect(m.html).toContain("Shampoo &amp; Co");
  });
});
