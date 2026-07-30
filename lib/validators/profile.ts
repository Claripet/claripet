import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+?[0-9 ()-]{8,20}$/, "Invalid phone format").or(z.literal("")).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
