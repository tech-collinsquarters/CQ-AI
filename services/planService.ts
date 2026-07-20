import { getPlanConfig } from "@/constants/plans";
import { getChatQuota } from "@/services/chatService";
import { getPrisma } from "@/lib/prisma";
import type { AppUser } from "@/services/authService";
import type { PlanUsageDto } from "@/types/plan";

export async function getPlanUsage(user: AppUser): Promise<PlanUsageDto> {
  const config = getPlanConfig(user.plan);

  const [quota, fileUsage] = await Promise.all([
    getChatQuota(user),
    getPrisma().caseFile.aggregate({
      where: { case: { userId: user.id } },
      _count: true,
      _sum: { sizeBytes: true },
    }),
  ]);

  return {
    plan: user.plan,
    planLabel: config.label,
    planDescription: config.description,
    dailyMessageLimit: config.dailyMessageLimit,
    messagesUsedToday: quota.used,
    messagesRemainingToday: quota.remaining,
    maxCaseFiles: config.maxCaseFiles,
    maxCaseFilesTotalBytes: config.maxCaseFilesTotalBytes,
    totalCaseFilesUsed: fileUsage._count,
    totalCaseFilesBytesUsed: fileUsage._sum.sizeBytes ?? 0,
  };
}
