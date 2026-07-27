-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jurisdiction" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "case_files" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "case_intakes" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "cases" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "chat_messages" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "daily_usage" ALTER COLUMN "id" DROP DEFAULT;
