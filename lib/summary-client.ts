async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function generateCaseSummary(
  caseId: string,
): Promise<{ summary: string; summaryUpdatedAt: string }> {
  const response = await fetch(`/api/cases/${caseId}/summary`, {
    method: "POST",
    credentials: "include",
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Unable to generate summary",
    );
  }

  return data as { summary: string; summaryUpdatedAt: string };
}
