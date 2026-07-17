import { NextResponse } from "next/server";
import { login } from "@/services/authService";
import { loginSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    // 1. Parse JSON
    const body = await request.json();

    // 2. Validate
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

    // 3. Login
    const { email, password } = parsed.data;
    const { user, session } = await login(email, password);

    // 4. Success
    return NextResponse.json({ user, session }, { status: 200 });
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

    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json(
      { error: "Unable to log in" },
      { status: 500 },
    );
  }
}
