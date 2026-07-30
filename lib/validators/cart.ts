import { z } from "zod";

export const addToCartSchema = z.object({
  product_id: z.string().uuid(),
  size_id: z.string().uuid(),
  qty: z.number().int().min(1).max(99).default(1),
});

export const updateCartItemSchema = z.object({
  qty: z.number().int().min(1).max(99),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
