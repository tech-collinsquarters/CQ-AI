import { z } from "zod";

export const updateProfileSchema = z.object({
  jurisdiction: z
    .string()
    .trim()
    .max(120, "Jurisdiction is too long (120 characters max)")
    .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
