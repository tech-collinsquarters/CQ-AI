import { NextResponse } from "next/server";

import { getCurrentUser } from "@/services/authService";
import { getCaseForUser } from "@/services/caseService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

    return NextResponse.json({ case: caseRecord }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cases/[id] failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch case" },
      { status: 500 },
    );
  }
}
