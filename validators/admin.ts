import { z } from "zod";

export const updateUserAccessSchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]).optional(),
    plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).optional(),
  })
  .refine((data) => data.role !== undefined || data.plan !== undefined, {
    message: "Provide a role or plan to update",
  });

export type UpdateUserAccessInput = z.infer<typeof updateUserAccessSchema>;
