import { z } from "zod";
import { toneSchema } from "./product";

export const articleSectionSchema = z.object({
  h: z.string().min(1).max(200),
  p: z.string().min(1),
});

export const createArticleSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  read_time: z.string().max(50).optional(),
  tone: toneSchema.optional(),
  featured: z.boolean().default(false),
  excerpt: z.string().max(500).optional(),
  body: z.array(z.string()).default([]),
  sections: z.array(articleSectionSchema).default([]),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
