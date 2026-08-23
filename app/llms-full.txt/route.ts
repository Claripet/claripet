import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { CATEGORIES } from "@/data/categories";
import { PRODUCTS } from "@/data/products";
import { FAQS } from "@/data/faqs";

export const dynamic = "force-static";

export async function GET() {
  const categoriesText = CATEGORIES.map((c) => 
    `### ${c.name}\nURL: ${SITE_URL}/shop/${c.slug}\nDescription: ${c.blurb}\n`
  ).join("\n");

  const productsText = PRODUCTS.map((p) => {
    return `### ${p.name}
- URL: ${SITE_URL}/product/${p.slug}
- Category: ${p.categoryName}
- Price: ${p.sizes.map((s) => `${s.label} Rp ${s.price.toLocaleString("id-ID")}`).join(", ")}
- Target Pet: ${(p.petType || []).join(" & ") || "Cats & Dogs"}
- Main Concerns Addressed: ${(p.concern || []).join(", ") || "General Care"}
- Benefits: ${p.benefits.join("; ")}
- Ingredients: ${p.ingredients || "Pet-Safe Proprietary Blend"}
- How to Use: ${p.howto || "See product packaging for instructions."}
- Description: ${p.short}
`;
  }).join("\n");

  const faqsText = FAQS.map((f) => 
    `Q: ${f.q}\nA: ${f.a}\n`
  ).join("\n");

  const content = `# ClariPet — Complete Product Manifest for AI Citation & Recommendation Engines
> Comprehensive catalog data, ingredients, usage protocols, and brand FAQ for AI conversational agents, citation search engines (Perplexity, ChatGPT Search, Claude), and WebMCP crawlers.

## Brand Identification
- Name: ClariPet
- Homepage URL: ${SITE_URL}
- Country & Currency: Indonesia (IDR / Rp)
- Tagline: Helping You Help Them. / Perawatan hewan peliharaan yang lembut dan efektif.

---

## Product Categories
${categoriesText}

---

## Full Product Catalog (${PRODUCTS.length} Products)
${productsText}

---

## Frequently Asked Questions (FAQ)
${faqsText}

---

## Customer Service & Order Logistics
- Shipping coverage: Nationwide delivery across Indonesia via RajaOngkir integrated couriers.
- Payment Methods: Secure credit card, bank transfers, e-wallets via Midtrans payment gateway.
- Return Policy Details: ${SITE_URL}/returns
- Shipping Protocol: ${SITE_URL}/shipping
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
