import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/services/authService";
import { createCase, listCasesForUser } from "@/services/caseService";
import { createCaseSchema } from "@/validators/case";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cases = await listCasesForUser(user.id);
    return NextResponse.json({ cases }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cases failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch cases" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const input = createCaseSchema.parse(body);
    const caseRecord = await createCase(user.id, input);

    return NextResponse.json({ case: caseRecord }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("POST /api/cases failed:", error);
    return NextResponse.json(
      { error: "Unable to create case" },
      { status: 500 },
    );
  }
}
