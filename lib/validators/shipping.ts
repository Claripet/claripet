import { z } from "zod";

export const shippingQuoteSchema = z.object({
  province: z.string().min(1, "Provinsi tujuan wajib diisi"),
  city: z.string().optional(),
  destinationId: z.number().optional(),
  weightGrams: z.number().optional(),
  subtotal: z.number().optional(),
  couriers: z.string().optional(),
});

export type ShippingQuoteInput = z.infer<typeof shippingQuoteSchema>;
