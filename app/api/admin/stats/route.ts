import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/services/authService";
import { getAdminStats } from "@/services/adminService";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await getAdminStats();
    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/stats failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch stats" },
      { status: 500 },
    );
  }
}
