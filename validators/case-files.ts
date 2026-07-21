import { CaseFileKind } from "@prisma/client";

const MB = 1024 * 1024;
export const MAX_BEDROCK_IMAGE_BYTES = Math.floor(3.75 * MB);
export const MAX_BEDROCK_DOCUMENT_BYTES = Math.floor(4.5 * MB);

/**
 * Mime types accepted for case knowledge files, mapped to the Bedrock
 * Converse API's ImageFormat/DocumentFormat values used when the file is
 * injected into a chat turn (see lib/ai/bedrock.ts).
 */
export const IMAGE_MIME_TO_FORMAT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const DOCUMENT_MIME_TO_FORMAT: Record<string, string> = {
  "application/pdf": "pdf",
  "text/csv": "csv",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
  "text/markdown": "md",
};

export function classifyMimeType(mimeType: string): CaseFileKind | null {
  if (mimeType in IMAGE_MIME_TO_FORMAT) {
    return CaseFileKind.IMAGE;
  }
  if (mimeType in DOCUMENT_MIME_TO_FORMAT) {
    return CaseFileKind.DOCUMENT;
  }
  return null;
}

export function isSupportedMimeType(mimeType: string): boolean {
  return classifyMimeType(mimeType) !== null;
}

export function getMaxFileBytes(mimeType: string): number | null {
  const kind = classifyMimeType(mimeType);
  if (kind === CaseFileKind.IMAGE) {
    return MAX_BEDROCK_IMAGE_BYTES;
  }
  if (kind === CaseFileKind.DOCUMENT) {
    return MAX_BEDROCK_DOCUMENT_BYTES;
  }
  return null;
}

export const SUPPORTED_FILE_EXTENSIONS =
  ".png,.jpg,.jpeg,.gif,.webp,.pdf,.csv,.doc,.docx,.xls,.xlsx,.txt,.md";
