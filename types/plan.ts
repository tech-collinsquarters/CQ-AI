import type { Plan } from "@prisma/client";

export type PlanUsageDto = {
  plan: Plan;
  planLabel: string;
  planDescription: string;
  dailyMessageLimit: number;
  messagesUsedToday: number;
  messagesRemainingToday: number;
  maxCaseFiles: number;
  maxCaseFilesTotalBytes: number;
  /** Aggregated across every case the user owns */
  totalCaseFilesUsed: number;
  totalCaseFilesBytesUsed: number;
};
