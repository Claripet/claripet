import { z } from "zod";

export const petProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  species: z.string().min(1).max(40).default("Dog"),
  breed: z.string().max(80).optional().nullable(),
  birthdate: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type PetProfileInput = z.infer<typeof petProfileSchema>;
