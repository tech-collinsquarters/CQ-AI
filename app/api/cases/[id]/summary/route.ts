import { NextResponse } from "next/server";

import { getCaseForUser } from "@/services/caseService";
import { generateCaseSummary } from "@/services/caseSummaryService";
import { getCurrentUser } from "@/services/authService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
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

    const result = await generateCaseSummary(caseRecord);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/cases/[id]/summary failed:", error);
    return NextResponse.json(
      { error: "Unable to generate summary" },
      { status: 500 },
    );
  }
}
