import { NextResponse } from "next/server";

import { createAuthRouteClient } from "@/lib/supabase/route-handler";
import { forgotPasswordSchema } from "@/validators/auth";

/**
 * Always returns the same success message to avoid email enumeration.
 */
export async function POST(request: Request) {
  const genericMessage =
    "If an account exists for that email, you will receive password reset instructions shortly.";

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { supabase } = await createAuthRouteClient();
    const origin = new URL(request.url).origin;
    const redirectTo = `${origin}/auth/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      { redirectTo },
    );

    if (error) {
      // Still return generic success — do not reveal whether the email exists.
      console.error("POST /api/auth/forgot-password:", error.message);
    }

    return NextResponse.json({ message: genericMessage }, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    console.error("POST /api/auth/forgot-password failed:", error);
    // Same generic message on unexpected errors from the client POV.
    return NextResponse.json({ message: genericMessage }, { status: 200 });
  }
}
