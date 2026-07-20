-- CreateEnum
CREATE TYPE "CaseFileKind" AS ENUM ('IMAGE', 'DOCUMENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastActiveAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "cases" ADD COLUMN "summary" TEXT,
ADD COLUMN "summaryUpdatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "case_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "uploadedBy" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "kind" "CaseFileKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_files_caseId_createdAt_idx" ON "case_files"("caseId", "createdAt");

-- AddForeignKey
ALTER TABLE "case_files" ADD CONSTRAINT "case_files_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
