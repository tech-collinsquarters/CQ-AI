import { NextResponse } from "next/server";

import {
  createAuthRouteClient,
  jsonWithAuthCookies,
} from "@/lib/supabase/route-handler";
import { resetPasswordSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { supabase, pendingCookies } = await createAuthRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Reset link is invalid or has expired. Request a new password reset.",
        },
        { status: 401 },
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Unable to update password" },
        { status: 400 },
      );
    }

    return jsonWithAuthCookies({ success: true }, pendingCookies, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    console.error("POST /api/auth/reset-password failed:", error);
    return NextResponse.json(
      { error: "Unable to reset password" },
      { status: 500 },
    );
  }
}
