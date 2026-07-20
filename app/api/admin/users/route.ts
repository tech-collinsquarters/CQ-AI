import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/services/authService";
import { listUsersForAdmin } from "@/services/adminService";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await listUsersForAdmin();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/users failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch users" },
      { status: 500 },
    );
  }
}
