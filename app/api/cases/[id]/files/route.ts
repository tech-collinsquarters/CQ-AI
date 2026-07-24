import { NextResponse } from "next/server";

import { validateUploadedFileContent } from "@/lib/file-validation";
import { getCaseForUser } from "@/services/caseService";
import {
  checkCaseFileLimits,
  createCaseFile,
  listCaseFiles,
} from "@/services/caseFileService";
import { getCurrentUser } from "@/services/authService";
import {
  getMaxFileBytes,
  MAX_BEDROCK_DOCUMENT_BYTES,
} from "@/validators/case-files";

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
    const contentLength = Number(request.headers.get("content-length"));
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BEDROCK_DOCUMENT_BYTES + 64_000
    ) {
      return NextResponse.json(
        { error: "Upload is too large for the AI provider" },
        { status: 413 },
      );
    }

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

    const maxFileBytes = getMaxFileBytes(uploaded.type);
    if (!maxFileBytes) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (uploaded.size <= 0 || uploaded.size > maxFileBytes) {
      return NextResponse.json(
        {
          error: `File exceeds the AI provider's ${(maxFileBytes / (1024 * 1024)).toFixed(2)} MB limit for this type`,
        },
        { status: 413 },
      );
    }

    const limitError = await checkCaseFileLimits(user, caseRecord.id, uploaded.size);
    if (limitError) {
      return NextResponse.json({ error: limitError.message }, { status: 400 });
    }

    const bytes = new Uint8Array(await uploaded.arrayBuffer());
    const contentError = await validateUploadedFileContent(
      bytes,
      uploaded.type || "application/octet-stream",
    );
    if (contentError) {
      return NextResponse.json({ error: contentError }, { status: 400 });
    }

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
