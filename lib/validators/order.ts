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
  notes: z.string().trim().max(500).optional(),
  payment_method: z.string().max(50).optional(),
  // Customer-selected courier from the shipping rate list. Required: the
  // order stores it so the admin knows which courier to ship with.
  courier_code: z.string().min(1, "Pilih kurir pengiriman").max(50),
  courier_service_code: z.string().max(50).optional(),
});

// Admin PATCH: change status, set/correct the resi, or both.
export const updateOrderStatusSchema = z
  .object({
    status: orderStatusSchema.optional(),
    tracking_number: z
      .string()
      .trim()
      .min(5, "Nomor resi terlalu pendek")
      .max(40, "Nomor resi terlalu panjang")
      .regex(/^[A-Za-z0-9-]+$/, "Nomor resi hanya boleh huruf, angka, dan tanda hubung")
      .optional(),
  })
  .refine((v) => v.status !== undefined || v.tracking_number !== undefined, {
    message: "Nothing to update",
  });

export const orderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const paymentCreateSchema = z.object({
  order_id: z.string().uuid(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
