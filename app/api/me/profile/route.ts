import { NextResponse } from "next/server";

import { getCurrentUser, updateUserJurisdiction } from "@/services/authService";
import { updateProfileSchema } from "@/validators/profile";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile update" },
        { status: 400 },
      );
    }

    const updated = await updateUserJurisdiction(
      user.id,
      parsed.data.jurisdiction,
    );

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/me/profile failed:", error);
    return NextResponse.json(
      { error: "Unable to update profile" },
      { status: 500 },
    );
  }
}
