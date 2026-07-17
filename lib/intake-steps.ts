import type { CaseCategory } from "@prisma/client";

export type IntakeStepId = "category" | "subcategory" | "description";

export function getIntakeSteps(category?: CaseCategory): IntakeStepId[] {
  if (category === "IMMIGRATION_LAW") {
    return ["category", "subcategory", "description"];
  }

  return ["category", "description"];
}

export function getStepLabel(step: IntakeStepId): string {
  switch (step) {
    case "category":
      return "Matter type";
    case "subcategory":
      return "Immigration type";
    case "description":
      return "Description";
    default:
      return step;
  }
}

export function getStepQuestion(step: IntakeStepId): string {
  switch (step) {
    case "category":
      return "What type of legal matter do you need help with?";
    case "subcategory":
      return "What type of immigration matter?";
    case "description":
      return "Briefly describe your legal issue.";
    default:
      return "";
  }
}
