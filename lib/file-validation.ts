import "server-only";

import { fileTypeFromBuffer } from "file-type";

import { isSupportedMimeType } from "@/validators/case-files";

const TEXT_MIME_TYPES = new Set(["text/csv", "text/plain", "text/markdown"]);
const COMPOUND_DOCUMENT_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.ms-excel",
]);

/**
 * Verifies uploaded bytes instead of trusting the browser-supplied MIME type.
 * Returns a user-safe error message when the content does not match.
 */
export async function validateUploadedFileContent(
  bytes: Uint8Array,
  declaredMimeType: string,
): Promise<string | null> {
  if (!isSupportedMimeType(declaredMimeType)) {
    return "Unsupported file type";
  }

  if (TEXT_MIME_TYPES.has(declaredMimeType)) {
    if (bytes.includes(0)) {
      return "The uploaded text file contains binary data";
    }
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      return null;
    } catch {
      return "Text files must use UTF-8 encoding";
    }
  }

  const detected = await fileTypeFromBuffer(bytes);
  if (!detected) {
    return "The uploaded file content could not be verified";
  }

  if (detected.mime === declaredMimeType) {
    return null;
  }

  // Legacy DOC and XLS files share the OLE Compound File signature, so their
  // exact type cannot be distinguished reliably from bytes alone.
  if (
    detected.mime === "application/x-cfb" &&
    COMPOUND_DOCUMENT_MIME_TYPES.has(declaredMimeType)
  ) {
    return null;
  }

  return "The uploaded file content does not match its declared type";
}
