import type { Plan } from "@prisma/client";

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
    dailyMessageLimit: 2,
    description: "Getting started — limited daily AI messages",
    maxCaseFiles: 3,
    maxCaseFilesTotalBytes: 8 * MB,
  },
  [Plan.PRO]: {
    label: "Pro",
    dailyMessageLimit: 20,
    description: "For active matters — high daily AI message allowance",
    // Bedrock Converse accepts at most five documents in one message.
    maxCaseFiles: 5,
    maxCaseFilesTotalBytes: 18 * MB,
  },
  [Plan.ENTERPRISE]: {
    label: "Enterprise",
    dailyMessageLimit: 100,
    description: "Firm-wide usage with priority support",
    // Larger knowledge bases should use an ingestion/RAG pipeline rather than
    // embedding every raw file in every model request.
    maxCaseFiles: 5,
    maxCaseFilesTotalBytes: 18 * MB,
  },
};

export const PLAN_ORDER: Plan[] = [Plan.FREE, Plan.PRO, Plan.ENTERPRISE];

export function getPlanConfig(plan: Plan): PlanConfig {
  return PLAN_CONFIG[plan];
}
