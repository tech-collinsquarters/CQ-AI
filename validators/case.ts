import { z } from "zod";

import {
  CASE_CATEGORY_VALUES,
  IMMIGRATION_SUBCATEGORY_VALUES,
  isImmigrationCategory,
} from "@/constants/case-categories";

export const intakeDescriptionSchema = z
  .string()
  .trim()
  .min(20, "Please provide at least 20 characters.")
  .max(1000, "Description must be 1000 characters or fewer.");

export const intakeFormSchema = z
  .object({
    category: z.enum(CASE_CATEGORY_VALUES, {
      message: "Please select a legal matter type.",
    }),
    subcategory: z.enum(IMMIGRATION_SUBCATEGORY_VALUES).optional().nullable(),
    description: intakeDescriptionSchema,
  })
  .superRefine((data, ctx) => {
    if (isImmigrationCategory(data.category) && !data.subcategory) {
      ctx.addIssue({
        code: "custom",
        message: "Please select an immigration matter type.",
        path: ["subcategory"],
      });
    }
  });

export const createCaseSchema = intakeFormSchema.transform((data) => ({
  category: data.category,
  subcategory: isImmigrationCategory(data.category)
    ? data.subcategory ?? null
    : null,
  description: data.description,
}));

export type IntakeFormInput = z.input<typeof intakeFormSchema>;
export type IntakeFormValues = z.infer<typeof intakeFormSchema>;
export type CreateCasePayload = z.infer<typeof createCaseSchema>;
