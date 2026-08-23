import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { CATEGORIES } from "@/data/categories";
import { PRODUCTS } from "@/data/products";
import { formatListPrice } from "@/lib/pricing";

export const dynamic = "force-static";

export async function GET() {
  const content = `# ClariPet — Premium Pet Care, Grooming & Health Products
> Gentle, effective, and pet-safe formulations for dogs and cats. Made in Indonesia.

## About Us
ClariPet (https://claripetcare.com) is an Indonesian pet care brand specializing in premium non-alcoholic perfumes, gentle hygiene & grooming essentials, coat supplements, skin care, and home environment solutions for cats and dogs. Our mission is making everyday grooming effortless while strengthening the bond between pet parents and their furry companions.

## Key Value Propositions
- **Pet-Safe Formulations:** Non-alcoholic, gentle ingredients formulated specifically for canine and feline coats and skin pH.
- **Made in Indonesia:** Proudly produced locally adhering to high international safety and cleanliness standards.
- **Complete Care Ecosystem:** Ranging from bad odor prevention and oral sprays to tear stain eliminators and anti-itch gentle wash shampoos.

## Core Product Categories
${CATEGORIES.map((c) => `- [${c.name}](${SITE_URL}/shop/${c.slug}): ${c.blurb}`).join("\n")}

## Featured Products
${PRODUCTS.slice(0, 8).map((p) => `- [${p.name}](${SITE_URL}/product/${p.slug}) - ${formatListPrice(p)}: ${p.short}`).join("\n")}

## Interactive Tools
- [Pet Care Recommendation Quiz](${SITE_URL}/quiz): A branching quiz of about 5-7 questions, under 2 minutes, covering pet type, age, and up to two main care needs (bathing, skin, coat and nutrition, eyes/ears/mouth, scent, behaviour and household odour). Returns one main product plus up to two companions. Pets under 2 months old are shown veterinary guidance instead of product recommendations.

## Contact & Help
- Website: ${SITE_URL}
- Shop All: ${SITE_URL}/shop
- FAQ: ${SITE_URL}/faq
- Customer Support: ${SITE_URL}/contact
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
