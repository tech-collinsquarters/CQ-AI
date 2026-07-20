import { ChatRole } from "@prisma/client";

import { converse } from "@/lib/ai/bedrock";
import { CASE_SUMMARY_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getPrisma } from "@/lib/prisma";
import type { CaseDto } from "@/types/case";

/** How much conversation is fed into the one-shot summary call */
const SUMMARY_HISTORY_LIMIT = 80;
const SUMMARY_MAX_TOKENS = 700;

export type CaseSummaryResult = {
  summary: string;
  summaryUpdatedAt: string;
};

export type CaseSummaryError = {
  error: string;
};

export async function generateCaseSummary(
  caseRecord: CaseDto,
): Promise<CaseSummaryResult | CaseSummaryError> {
  const prisma = getPrisma();

  const history = await prisma.chatMessage.findMany({
    where: { caseId: caseRecord.id },
    orderBy: { createdAt: "desc" },
    take: SUMMARY_HISTORY_LIMIT,
  });

  if (history.length === 0) {
    return { error: "Nothing to summarize yet — start a conversation first." };
  }

  history.reverse();
  const transcript = history
    .map(
      (message) =>
        `${message.role === ChatRole.USER ? "Client" : "Assistant"}: ${message.content}`,
    )
    .join("\n\n");

  let summary: string;
  try {
    summary = (
      await converse({
        system: [{ text: CASE_SUMMARY_SYSTEM_PROMPT }],
        messages: [{ role: "user", content: [{ text: transcript }] }],
        inferenceConfig: { maxTokens: SUMMARY_MAX_TOKENS, temperature: 0.2 },
      })
    ).trim();
  } catch (error) {
    console.error("generateCaseSummary failed:", error);
    return { error: "Could not generate a summary right now. Please try again." };
  }

  if (!summary) {
    return { error: "Could not generate a summary right now. Please try again." };
  }

  const updated = await prisma.case.update({
    where: { id: caseRecord.id },
    data: { summary, summaryUpdatedAt: new Date() },
    select: { summary: true, summaryUpdatedAt: true },
  });

  return {
    summary: updated.summary!,
    summaryUpdatedAt: updated.summaryUpdatedAt!.toISOString(),
  };
}
