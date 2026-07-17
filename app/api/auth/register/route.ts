import { NextResponse } from "next/server";
import { register } from "@/services/authService";
import { registerSchema } from "@/validators/auth";

function isDuplicateEmailError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as {
    code?: string;
    message?: string;
    status?: number;
  };

  if (err.code === "P2002") return true;
  if (err.status === 422 || err.status === 409) {
    const message = err.message?.toLowerCase() ?? "";
    if (
      message.includes("already") ||
      message.includes("registered") ||
      message.includes("exists")
    ) {
      return true;
    }
  }

  const message = err.message?.toLowerCase() ?? "";
  return (
    message.includes("user already registered") ||
    message.includes("already been registered") ||
    message.includes("email address has already been registered")
  );
}

export async function POST(request: Request) {
  try {
    // 1. Parse JSON
    const body = await request.json();

    // 2. Validate
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    // 3. Register
    const { fullName, email, password } = parsed.data;
    const { user } = await register(fullName, email, password);

    // 4. Success
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (isDuplicateEmailError(error)) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 },
      );
    }

    const err = error as { status?: number; code?: string; message?: string };

    if (err.status === 429 || err.code === "over_email_send_rate_limit") {
      return NextResponse.json(
        { error: "Email rate limit exceeded. Try again later." },
        { status: 429 },
      );
    }

    if (err.code === "email_address_invalid" || err.status === 400) {
      return NextResponse.json(
        {
          error:
            err.message ??
            "Email address is invalid. Use a real email domain (not example.com).",
        },
        { status: 400 },
      );
    }

    console.error("POST /api/auth/register failed:", error);
    return NextResponse.json(
      { error: "Unable to register user" },
      { status: 500 },
    );
  }
}
