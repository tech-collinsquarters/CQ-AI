import type { CaseFileDto } from "@/types/case";

async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function fetchCaseFiles(caseId: string): Promise<CaseFileDto[]> {
  const response = await fetch(`/api/cases/${caseId}/files`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await parseJson(response);
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to load files",
    );
  }

  const data = await parseJson(response);
  return (data.files ?? []) as CaseFileDto[];
}

export async function uploadCaseFile(
  caseId: string,
  file: File,
): Promise<CaseFileDto> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/cases/${caseId}/files`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to upload file",
    );
  }

  return data.file as CaseFileDto;
}

export async function deleteCaseFile(
  caseId: string,
  fileId: string,
): Promise<void> {
  const response = await fetch(`/api/cases/${caseId}/files/${fileId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await parseJson(response);
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to delete file",
    );
  }
}
