import { z } from "zod";

// Only the destination comes from the browser. Subtotal (free-shipping
// threshold) and parcel weight are computed server-side from the signed-in
// user's cart in app/api/shipping/quote, so the quote shown at checkout is the
// same one the order is billed at. Extra keys are stripped by zod.
export const shippingQuoteSchema = z.object({
  province: z.string().trim().min(1, "Provinsi tujuan wajib diisi").max(100),
  city: z.string().trim().max(100).optional(),
});

export type ShippingQuoteInput = z.infer<typeof shippingQuoteSchema>;
