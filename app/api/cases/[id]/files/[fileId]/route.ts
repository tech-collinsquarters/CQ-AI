import { NextResponse } from "next/server";

import { getCaseForUser } from "@/services/caseService";
import { deleteCaseFile } from "@/services/caseFileService";
import { getCurrentUser } from "@/services/authService";

type RouteContext = {
  params: Promise<{ id: string; fileId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, fileId } = await context.params;
    const caseRecord = await getCaseForUser(user.id, id);
    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const deleted = await deleteCaseFile(caseRecord.id, fileId);
    if (!deleted) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/cases/[id]/files/[fileId] failed:", error);
    return NextResponse.json(
      { error: "Unable to delete file" },
      { status: 500 },
    );
  }
}
