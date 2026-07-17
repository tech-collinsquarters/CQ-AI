import type { CaseDto, CaseListItem, CreateCaseInput } from "@/types/case";

async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

async function parseError(response: Response, fallback: string) {
  const data = await parseJson(response);
  throw new Error(typeof data.error === "string" ? data.error : fallback);
}

export async function fetchCases(): Promise<CaseListItem[]> {
  const response = await fetch("/api/cases", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    await parseError(response, "Unable to fetch cases");
  }

  const data = await parseJson(response);
  return data.cases as CaseListItem[];
}

export async function fetchCaseById(caseId: string): Promise<CaseDto | null> {
  const response = await fetch(`/api/cases/${caseId}`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    await parseError(response, "Unable to fetch case");
  }

  const data = await parseJson(response);
  return data.case as CaseDto;
}

export async function createCaseRequest(
  input: CreateCaseInput,
): Promise<CaseDto> {
  const response = await fetch("/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    await parseError(response, "Unable to create case");
  }

  const data = await parseJson(response);
  return data.case as CaseDto;
}
