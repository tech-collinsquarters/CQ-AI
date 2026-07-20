import type {
  CaseCategory,
  CaseFileKind,
  CaseStatus,
  ImmigrationSubcategory,
} from "@prisma/client";

export type CaseIntakeDto = {
  id: string;
  category: CaseCategory;
  subcategory: ImmigrationSubcategory | null;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CaseDto = {
  id: string;
  userId: string;
  title: string;
  status: CaseStatus;
  summary: string | null;
  summaryUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  intake: CaseIntakeDto | null;
};

export type CaseFileDto = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind: CaseFileKind;
  createdAt: string;
};

export type CaseListItem = Pick<
  CaseDto,
  "id" | "title" | "status" | "createdAt"
>;

export type CreateCaseInput = {
  category: CaseCategory;
  subcategory?: ImmigrationSubcategory | null;
  description: string;
};
