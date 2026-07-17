import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/authService";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/auth/me failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch current user" },
      { status: 500 },
    );
  }
}
