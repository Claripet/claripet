import { z } from "zod";
import { toneSchema } from "./product";

export const createReviewSchema = z.object({
  author_name: z.string().min(1).max(120),
  pet_name: z.string().max(120).optional(),
  rating: z.number().int().min(1).max(5).default(5),
  body: z.string().min(1).max(2000),
  photo_url: z.string().url().max(500).optional(),
  // Null clears an existing link; undefined leaves it untouched on update.
  product_id: z.string().uuid().nullable().optional(),
  tone: toneSchema.optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
