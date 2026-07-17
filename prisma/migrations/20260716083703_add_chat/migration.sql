-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('ACTIVE');

-- CreateEnum
CREATE TYPE "InitialCategory" AS ENUM ('STUDENT_VISA', 'SKILLED_MIGRATION', 'PARTNER_VISA', 'SOMETHING_ELSE');

-- CreateTable
CREATE TABLE "Chat" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "status" "ChatStatus" NOT NULL DEFAULT 'ACTIVE',
    "initialCategory" "InitialCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
