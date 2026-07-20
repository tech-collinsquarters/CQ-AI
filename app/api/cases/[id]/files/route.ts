import { NextResponse } from "next/server";

import { getCaseForUser } from "@/services/caseService";
import { createCaseFile, listCaseFiles } from "@/services/caseFileService";
import { getCurrentUser } from "@/services/authService";

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

    const files = await listCaseFiles(caseRecord.id);
    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cases/[id]/files failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch files" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
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

    const formData = await request.formData().catch(() => null);
    const uploaded = formData?.get("file");

    if (!uploaded || typeof uploaded === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = new Uint8Array(await uploaded.arrayBuffer());
    const result = await createCaseFile({
      user,
      caseRecord,
      fileName: uploaded.name || "upload",
      mimeType: uploaded.type || "application/octet-stream",
      bytes,
    });

    if ("code" in result) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ file: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cases/[id]/files failed:", error);
    return NextResponse.json(
      { error: "Unable to upload file" },
      { status: 500 },
    );
  }
}
