import type { Case, CaseIntake } from "@prisma/client";
import { CaseStatus } from "@prisma/client";

import { generateCaseTitle } from "@/constants/case-categories";
import { getPrisma } from "@/lib/prisma";
import type { CaseDto, CaseListItem, CreateCaseInput } from "@/types/case";

type CaseWithIntake = Case & { intake: CaseIntake | null };

function toCaseIntakeDto(intake: CaseIntake) {
  return {
    id: intake.id,
    category: intake.category,
    subcategory: intake.subcategory,
    description: intake.description,
    createdAt: intake.createdAt.toISOString(),
    updatedAt: intake.updatedAt.toISOString(),
  };
}

function toCaseDto(caseRecord: CaseWithIntake): CaseDto {
  return {
    id: caseRecord.id,
    userId: caseRecord.userId,
    title: caseRecord.title,
    status: caseRecord.status,
    summary: caseRecord.summary,
    summaryUpdatedAt: caseRecord.summaryUpdatedAt?.toISOString() ?? null,
    createdAt: caseRecord.createdAt.toISOString(),
    updatedAt: caseRecord.updatedAt.toISOString(),
    intake: caseRecord.intake ? toCaseIntakeDto(caseRecord.intake) : null,
  };
}

type CaseListSelect = Pick<Case, "id" | "title" | "status" | "createdAt">;

function toCaseListItem(caseRecord: CaseListSelect): CaseListItem {
  return {
    id: caseRecord.id,
    title: caseRecord.title,
    status: caseRecord.status,
    createdAt: caseRecord.createdAt.toISOString(),
  };
}

export async function createCase(
  userId: string,
  input: CreateCaseInput,
): Promise<CaseDto> {
  const title = generateCaseTitle(input.category);

  const caseRecord = await getPrisma().$transaction(async (tx) => {
    return tx.case.create({
      data: {
        userId,
        title,
        status: CaseStatus.ACTIVE,
        intake: {
          create: {
            category: input.category,
            subcategory: input.subcategory ?? null,
            description: input.description,
          },
        },
      },
      include: { intake: true },
    });
  });

  return toCaseDto(caseRecord);
}

export async function listCasesForUser(userId: string): Promise<CaseListItem[]> {
  const cases = await getPrisma().case.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
  });

  return cases.map(toCaseListItem);
}

export async function getCaseForUser(
  userId: string,
  caseId: string,
): Promise<CaseDto | null> {
  const caseRecord = await getPrisma().case.findFirst({
    where: { id: caseId, userId },
    include: { intake: true },
  });

  if (!caseRecord) {
    return null;
  }

  return toCaseDto(caseRecord);
}
