import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(100, "Full name must be 100 characters or fewer"),
    email: z.email().max(254),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128, "Password must be 128 characters or fewer"),
    confirmPassword: z.string().max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
