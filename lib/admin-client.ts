import type {
  AdminStats,
  AdminUserDetail,
  AdminUserRow,
} from "@/services/adminService";
import type { UpdateUserAccessInput } from "@/validators/admin";

async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

async function assertOk(response: Response, fallback: string) {
  if (!response.ok) {
    const data = await parseJson(response);
    throw new Error(typeof data.error === "string" ? data.error : fallback);
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/admin/stats", {
    method: "GET",
    credentials: "include",
  });
  await assertOk(response, "Unable to fetch stats");
  const data = await parseJson(response);
  return data.stats as AdminStats;
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const response = await fetch("/api/admin/users", {
    method: "GET",
    credentials: "include",
  });
  await assertOk(response, "Unable to fetch users");
  const data = await parseJson(response);
  return data.users as AdminUserRow[];
}

export async function fetchAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "GET",
    credentials: "include",
  });
  await assertOk(response, "Unable to fetch user");
  const data = await parseJson(response);
  return data.user as AdminUserDetail;
}

export async function updateAdminUser(
  userId: string,
  input: UpdateUserAccessInput,
): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Unable to update user");
}
