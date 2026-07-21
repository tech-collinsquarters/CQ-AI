import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/services/authService";
import { listUsersForAdmin } from "@/services/adminService";

function csvEscape(value: string): string {
  // Prevent spreadsheet applications from interpreting user-controlled cells
  // as formulas when an administrator opens the export.
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await listUsersForAdmin();

    const header = [
      "Full name",
      "Email",
      "Role",
      "Plan",
      "Joined",
      "Last active",
      "Cases",
      "Messages today",
    ];
    const rows = users.map((user) =>
      [
        user.fullName,
        user.email,
        user.role,
        user.plan,
        user.createdAt,
        user.lastActiveAt ?? "",
        String(user.caseCount),
        String(user.messagesToday),
      ]
        .map(csvEscape)
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users/export failed:", error);
    return NextResponse.json(
      { error: "Unable to export users" },
      { status: 500 },
    );
  }
}
