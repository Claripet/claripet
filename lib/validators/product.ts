import { z } from "zod";

export const toneSchema = z.enum([
  "sky",
  "sage",
  "pink",
  "lavender",
  "cream",
  "peach",
]);

export const productSizeSchema = z.object({
  label: z.string().min(1).max(50),
  stock: z.number().int().min(0).default(0),
  sku: z.string().max(50).optional(),
});

export const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(200).optional(),
  sort_order: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  category_id: z.string().uuid(),
  price: z.number().int().min(0), // IDR integer
  tone: toneSchema.optional(),
  best_seller: z.boolean().default(false),
  short: z.string().max(500).optional(),
  benefits: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  mascot: z.string().max(200).optional(),
  ingredients: z.string().optional(),
  howto: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]).default("draft"),
  sizes: z.array(productSizeSchema).min(1, "At least one size required"),
  images: z.array(productImageSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial();

// PATCH-only schema: scalar product fields, NO sizes/images (those are PUT's job).
// .strict() rejects any unknown key (id, created_at, slug, category_id, sizes, images)
// to prevent mass-assignment attacks.
export const patchProductSchema = updateProductSchema
  .omit({
    sizes: true,
    images: true,
    slug: true,
    category_id: true,
  })
  .strict();

export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(["price_asc", "price_desc", "name", "newest"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  // Comma-separated list of slugs — used by wishlist/recently-viewed pages to
  // fetch only the exact products they need rather than loading all products.
  slugs: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
