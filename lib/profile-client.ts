import type { AppUser } from "@/types/auth";

async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function updateProfile(
  jurisdiction: string | null,
): Promise<AppUser> {
  const response = await fetch("/api/me/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ jurisdiction }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to update profile",
    );
  }

  return data.user as AppUser;
}
