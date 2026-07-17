import { NextResponse } from "next/server";

import {
  createAuthRouteClient,
  jsonWithAuthCookies,
} from "@/lib/supabase/route-handler";
import { logoutWithClient } from "@/services/authService";

export async function POST() {
  try {
    const { supabase, pendingCookies } = await createAuthRouteClient();
    await logoutWithClient(supabase);

    return jsonWithAuthCookies({ success: true }, pendingCookies, {
      status: 200,
    });
  } catch (error) {
    console.error("POST /api/auth/logout failed:", error);
    return NextResponse.json(
      { error: "Unable to log out" },
      { status: 500 },
    );
  }
}
