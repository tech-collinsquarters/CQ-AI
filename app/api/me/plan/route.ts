import { NextResponse } from "next/server";

import { getCurrentUser } from "@/services/authService";
import { getPlanUsage } from "@/services/planService";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await getPlanUsage(user);
    return NextResponse.json({ usage }, { status: 200 });
  } catch (error) {
    console.error("GET /api/me/plan failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch plan usage" },
      { status: 500 },
    );
  }
}
