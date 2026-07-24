import { NextResponse } from "next/server";

import { getCaseForUser } from "@/services/caseService";
import { generateCaseSummary } from "@/services/caseSummaryService";
import { getCurrentUser } from "@/services/authService";
import { getChatQuota, releaseChatMessage, reserveChatMessage } from "@/services/chatService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  let quotaReservedFor: string | null = null;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const caseRecord = await getCaseForUser(user.id, id);
    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const reservedQuota = await reserveChatMessage(user);
    if (!reservedQuota) {
      return NextResponse.json(
        {
          error: "You have reached today's AI usage limit for your plan.",
          quota: await getChatQuota(user),
        },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }
    quotaReservedFor = user.id;

    const result = await generateCaseSummary(caseRecord);
    if ("error" in result) {
      await releaseChatMessage(user.id).catch((releaseError) =>
        console.error("releaseChatMessage failed:", releaseError),
      );
      quotaReservedFor = null;
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    quotaReservedFor = null;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (quotaReservedFor) {
      await releaseChatMessage(quotaReservedFor).catch((releaseError) =>
        console.error("releaseChatMessage failed:", releaseError),
      );
    }
    console.error("POST /api/cases/[id]/summary failed:", error);
    return NextResponse.json(
      { error: "Unable to generate summary" },
      { status: 500 },
    );
  }
}
