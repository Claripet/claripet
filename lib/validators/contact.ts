import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(100),
  message: z.string().min(1, "Message is required").max(2000),
  turnstileToken: z.string().optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
