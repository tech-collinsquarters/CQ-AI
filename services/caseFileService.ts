import { CaseFileKind, type CaseFile } from "@prisma/client";

import { getPlanConfig } from "@/constants/plans";
import { CASE_FILES_BUCKET, getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPrisma } from "@/lib/prisma";
import type { AppUser } from "@/services/authService";
import type { CaseDto, CaseFileDto } from "@/types/case";
import {
  classifyMimeType,
  DOCUMENT_MIME_TO_FORMAT,
  IMAGE_MIME_TO_FORMAT,
  MAX_BEDROCK_DOCUMENT_BYTES,
} from "@/validators/case-files";

let bucketEnsured = false;
const ALLOWED_CASE_FILE_MIME_TYPES = [
  ...Object.keys(IMAGE_MIME_TO_FORMAT),
  ...Object.keys(DOCUMENT_MIME_TO_FORMAT),
];

/** Creates the private case-files bucket on first use if it doesn't exist yet. */
async function ensureBucket(): Promise<void> {
  if (bucketEnsured) {
    return;
  }
  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Unable to reach Supabase Storage: ${listError.message}`);
  }
  if (!buckets.some((bucket) => bucket.name === CASE_FILES_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(
      CASE_FILES_BUCKET,
      {
        public: false,
        fileSizeLimit: MAX_BEDROCK_DOCUMENT_BYTES,
        allowedMimeTypes: ALLOWED_CASE_FILE_MIME_TYPES,
      },
    );
    // Ignore a race where another request created it first.
    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`Unable to create storage bucket: ${createError.message}`);
    }
  } else {
    const { error: updateError } = await supabase.storage.updateBucket(
      CASE_FILES_BUCKET,
      {
        public: false,
        fileSizeLimit: MAX_BEDROCK_DOCUMENT_BYTES,
        allowedMimeTypes: ALLOWED_CASE_FILE_MIME_TYPES,
      },
    );
    if (updateError) {
      throw new Error(`Unable to secure storage bucket: ${updateError.message}`);
    }
  }
  bucketEnsured = true;
}

function toDto(file: CaseFile): CaseFileDto {
  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    kind: file.kind,
    createdAt: file.createdAt.toISOString(),
  };
}

export type CaseFileLimitError = {
  code: "unsupported_type" | "too_many_files" | "too_large";
  message: string;
};

export async function listCaseFiles(caseId: string): Promise<CaseFileDto[]> {
  const files = await getPrisma().caseFile.findMany({
    where: { caseId },
    orderBy: { createdAt: "asc" },
  });
  return files.map(toDto);
}

export async function checkCaseFileLimits(
  user: AppUser,
  caseId: string,
  incomingBytes: number,
): Promise<CaseFileLimitError | null> {
  const plan = getPlanConfig(user.plan);
  const existing = await getPrisma().caseFile.aggregate({
    where: { caseId },
    _count: { _all: true },
    _sum: { sizeBytes: true },
  });

  if (existing._count._all >= plan.maxCaseFiles) {
    return {
      code: "too_many_files",
      message: `This case already has the maximum of ${plan.maxCaseFiles} files for your plan. Remove a file or upgrade your plan.`,
    };
  }

  const currentTotal = existing._sum.sizeBytes ?? 0;
  if (currentTotal + incomingBytes > plan.maxCaseFilesTotalBytes) {
    const remainingMb = Math.max(
      0,
      (plan.maxCaseFilesTotalBytes - currentTotal) / (1024 * 1024),
    );
    return {
      code: "too_large",
      message: `This file would exceed your plan's ${(plan.maxCaseFilesTotalBytes / (1024 * 1024)).toFixed(0)} MB case file limit (${remainingMb.toFixed(1)} MB remaining).`,
    };
  }

  return null;
}

function sanitizeStorageFileName(fileName: string): string {
  const cleaned = fileName
    .replace(/[\u0000-\u001f\u007f/\\]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || "upload").slice(0, 180);
}

export async function createCaseFile(options: {
  user: AppUser;
  caseRecord: CaseDto;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<CaseFileDto | CaseFileLimitError> {
  const { user, caseRecord, fileName, mimeType, bytes } = options;

  const kind = classifyMimeType(mimeType);
  if (!kind) {
    return {
      code: "unsupported_type",
      message: `"${mimeType}" isn't a supported file type. Upload an image (PNG/JPEG/GIF/WEBP) or document (PDF/CSV/DOC/DOCX/XLS/XLSX/TXT/MD).`,
    };
  }

  const limitError = await checkCaseFileLimits(user, caseRecord.id, bytes.byteLength);
  if (limitError) {
    return limitError;
  }

  await ensureBucket();

  const safeFileName = sanitizeStorageFileName(fileName);
  const storagePath = `cases/${caseRecord.id}/${crypto.randomUUID()}-${safeFileName}`;
  const supabase = getSupabaseAdmin();
  const { error: uploadError } = await supabase.storage
    .from(CASE_FILES_BUCKET)
    .upload(storagePath, bytes, { contentType: mimeType, upsert: false });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  let file: CaseFile;
  try {
    file = await getPrisma().caseFile.create({
      data: {
        caseId: caseRecord.id,
        uploadedBy: user.id,
        fileName: safeFileName,
        mimeType,
        sizeBytes: bytes.byteLength,
        storagePath,
        kind: kind as CaseFileKind,
      },
    });
  } catch (error) {
    // Compensate for a database failure after Storage accepted the upload.
    await supabase.storage
      .from(CASE_FILES_BUCKET)
      .remove([storagePath])
      .catch((cleanupError) =>
        console.error("Failed to clean up orphaned upload:", cleanupError),
      );
    throw error;
  }

  return toDto(file);
}

export async function deleteCaseFile(
  caseId: string,
  fileId: string,
): Promise<boolean> {
  const file = await getPrisma().caseFile.findFirst({
    where: { id: fileId, caseId },
  });
  if (!file) {
    return false;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(CASE_FILES_BUCKET)
    .remove([file.storagePath]);
  if (error) {
    throw new Error(`Unable to remove stored file: ${error.message}`);
  }
  await getPrisma().caseFile.delete({ where: { id: file.id } });
  return true;
}

/** Case files with their raw bytes, ready to inject into a Bedrock turn. */
export async function getCaseFilesWithBytes(
  caseId: string,
): Promise<{ file: CaseFile; bytes: Uint8Array }[]> {
  const files = await getPrisma().caseFile.findMany({
    where: { caseId },
    orderBy: { createdAt: "asc" },
  });
  if (files.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const results = await Promise.all(
    files.map(async (file) => {
      const { data, error } = await supabase.storage
        .from(CASE_FILES_BUCKET)
        .download(file.storagePath);
      if (error || !data) {
        console.error(
          `Failed to download case file ${file.id} (${file.storagePath}):`,
          error,
        );
        return null;
      }
      const bytes = new Uint8Array(await data.arrayBuffer());
      return { file, bytes };
    }),
  );

  return results.filter(
    (r): r is NonNullable<(typeof results)[number]> => r !== null,
  );
}
