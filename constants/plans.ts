import { Plan } from "@prisma/client";

export type PlanConfig = {
  label: string;
  /** Assistant messages a user may send per UTC day */
  dailyMessageLimit: number;
  description: string;
  /** Max number of case knowledge files (images/documents) per case */
  maxCaseFiles: number;
  /**
   * Max combined size of a case's knowledge files, in bytes. Every file is
   * injected into every assistant turn, so this is kept well under typical
   * Bedrock request payload limits — not just a storage cap.
   */
  maxCaseFilesTotalBytes: number;
};

const MB = 1024 * 1024;

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  [Plan.FREE]: {
    label: "Free",
    dailyMessageLimit: 20,
    description: "Getting started — limited daily AI messages",
    maxCaseFiles: 3,
    maxCaseFilesTotalBytes: 8 * MB,
  },
  [Plan.PRO]: {
    label: "Pro",
    dailyMessageLimit: 200,
    description: "For active matters — high daily AI message allowance",
    maxCaseFiles: 15,
    maxCaseFilesTotalBytes: 30 * MB,
  },
  [Plan.ENTERPRISE]: {
    label: "Enterprise",
    dailyMessageLimit: 2000,
    description: "Firm-wide usage with priority support",
    maxCaseFiles: 50,
    maxCaseFilesTotalBytes: 80 * MB,
  },
};

export const PLAN_ORDER: Plan[] = [Plan.FREE, Plan.PRO, Plan.ENTERPRISE];

export function getPlanConfig(plan: Plan): PlanConfig {
  return PLAN_CONFIG[plan];
}
