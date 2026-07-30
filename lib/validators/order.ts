import { z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const createOrderSchema = z.object({
  shipping_address_id: z.string().uuid().optional(),
  // If no shipping_address_id, provide inline address
  shipping_address: z
    .object({
      full_name: z.string().min(1).max(100),
      phone: z.string().min(8).max(20),
      street: z.string().min(1).max(300),
      city: z.string().min(1).max(100),
      province: z.string().min(1).max(100),
      postal_code: z.string().min(4).max(10),
    })
    .optional(),
  notes: z.string().max(500).optional(),
  payment_method: z.string().max(50).optional(),
  // Customer-selected courier from the shipping rate list
  courier_code: z.string().max(50).optional(),
  courier_service_code: z.string().max(50).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export const orderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
