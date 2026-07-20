import { NextResponse } from "next/server";
import type { Plan, Role } from "@prisma/client";

import { getCurrentAdmin } from "@/services/authService";
import { getUserDetail, updateUserAccess } from "@/services/adminService";
import { updateUserAccessSchema } from "@/validators/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const detail = await getUserDetail(id);
    if (!detail) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: detail }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/users/[id] failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateUserAccessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const { id } = await context.params;

    if (id === admin.id && parsed.data.role === "USER") {
      return NextResponse.json(
        { error: "You cannot remove your own admin role" },
        { status: 400 },
      );
    }

    await updateUserAccess(id, {
      role: parsed.data.role as Role | undefined,
      plan: parsed.data.plan as Plan | undefined,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] failed:", error);
    return NextResponse.json(
      { error: "Unable to update user" },
      { status: 500 },
    );
  }
}
