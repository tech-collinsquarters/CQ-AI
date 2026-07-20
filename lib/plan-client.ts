import type { PlanUsageDto } from "@/types/plan";

async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function fetchPlanUsage(): Promise<PlanUsageDto> {
  const response = await fetch("/api/me/plan", {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to load plan usage",
    );
  }

  return data.usage as PlanUsageDto;
}
