import { NextResponse } from "next/server";

import {
  createAuthRouteClient,
  jsonWithAuthCookies,
} from "@/lib/supabase/route-handler";
import { loginWithClient } from "@/services/authService";
import { loginSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

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
    const { email, password } = parsed.data;
    const { user } = await loginWithClient(supabase, email, password);

    return jsonWithAuthCookies({ user }, pendingCookies, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const err = error as { status?: number; code?: string; message?: string };

    if (
      err.status === 400 ||
      err.code === "invalid_credentials" ||
      err.message?.toLowerCase().includes("invalid login credentials")
    ) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (
      err.code === "email_not_confirmed" ||
      err.message?.toLowerCase().includes("email not confirmed")
    ) {
      return NextResponse.json(
        { error: "Please confirm your email before signing in." },
        { status: 401 },
      );
    }

    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json(
      { error: "Unable to log in" },
      { status: 500 },
    );
  }
}
