import { z } from "zod";

export const productSlugSchema = z.object({
  product_slug: z.string().min(1),
});

export type ProductSlugInput = z.infer<typeof productSlugSchema>;
