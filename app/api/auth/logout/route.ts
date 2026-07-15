import { NextResponse } from "next/server";
import { logout } from "@/services/authService";

export async function POST() {
  try {
    await logout();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/auth/logout failed:", error);
    return NextResponse.json(
      { error: "Unable to log out" },
      { status: 500 },
    );
  }
}
