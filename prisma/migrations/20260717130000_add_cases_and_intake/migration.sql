-- Drop legacy chat tables
DROP TABLE IF EXISTS "Chat";

DROP TYPE IF EXISTS "ChatStatus";
DROP TYPE IF EXISTS "InitialCategory";

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

CREATE TYPE "CaseCategory" AS ENUM (
  'FAMILY_LAW',
  'PROPERTY_LAW',
  'EMPLOYMENT_LAW',
  'CORPORATE_LAW',
  'COMMERCIAL_LAW',
  'CRIMINAL_LAW',
  'CIVIL_LAW',
  'IMMIGRATION_LAW',
  'CONSUMER_DISPUTE',
  'OTHER'
);

CREATE TYPE "ImmigrationSubcategory" AS ENUM (
  'STUDENT_VISA',
  'WORK_VISA',
  'PERMANENT_RESIDENCY',
  'CITIZENSHIP',
  'VISITOR_VISA',
  'PARTNER_VISA',
  'EMPLOYER_SPONSORSHIP',
  'APPEAL',
  'OTHER'
);

-- CreateTable
CREATE TABLE "cases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "case_intakes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "category" "CaseCategory" NOT NULL,
    "subcategory" "ImmigrationSubcategory",
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_intakes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "case_intakes_caseId_key" ON "case_intakes"("caseId");

CREATE INDEX "cases_userId_createdAt_idx" ON "cases"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "case_intakes" ADD CONSTRAINT "case_intakes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
