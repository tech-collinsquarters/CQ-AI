import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  FileText,
  Gavel,
  Globe,
  Heart,
  Home,
  Landmark,
  Scale,
  ShoppingBag,
  Users,
} from "lucide-react";

import type { CaseCategory, ImmigrationSubcategory } from "@prisma/client";

export const CASE_CATEGORIES: {
  value: CaseCategory;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "FAMILY_LAW", label: "Family Law", icon: Heart },
  { value: "PROPERTY_LAW", label: "Property Law", icon: Home },
  { value: "EMPLOYMENT_LAW", label: "Employment Law", icon: Briefcase },
  { value: "CORPORATE_LAW", label: "Corporate Law", icon: Building2 },
  { value: "COMMERCIAL_LAW", label: "Commercial Law", icon: FileText },
  { value: "CRIMINAL_LAW", label: "Criminal Law", icon: Gavel },
  { value: "CIVIL_LAW", label: "Civil Law", icon: Scale },
  { value: "IMMIGRATION_LAW", label: "Immigration Law", icon: Globe },
  { value: "CONSUMER_DISPUTE", label: "Consumer Dispute", icon: ShoppingBag },
  { value: "OTHER", label: "Other", icon: Landmark },
];

export const IMMIGRATION_SUBCATEGORIES: {
  value: ImmigrationSubcategory;
  label: string;
}[] = [
  { value: "STUDENT_VISA", label: "Student Visa" },
  { value: "WORK_VISA", label: "Work Visa" },
  { value: "PERMANENT_RESIDENCY", label: "Permanent Residency" },
  { value: "CITIZENSHIP", label: "Citizenship" },
  { value: "VISITOR_VISA", label: "Visitor Visa" },
  { value: "PARTNER_VISA", label: "Partner Visa" },
  { value: "EMPLOYER_SPONSORSHIP", label: "Employer Sponsorship" },
  { value: "APPEAL", label: "Appeal" },
  { value: "OTHER", label: "Other" },
];

export const CASE_CATEGORY_VALUES = CASE_CATEGORIES.map((c) => c.value) as [
  CaseCategory,
  ...CaseCategory[],
];

export const IMMIGRATION_SUBCATEGORY_VALUES = IMMIGRATION_SUBCATEGORIES.map(
  (c) => c.value,
) as [ImmigrationSubcategory, ...ImmigrationSubcategory[]];

export const CASE_TITLE_BY_CATEGORY: Record<CaseCategory, string> = {
  FAMILY_LAW: "Family Law Case",
  PROPERTY_LAW: "Property Law Case",
  EMPLOYMENT_LAW: "Employment Matter",
  CORPORATE_LAW: "Corporate Law Case",
  COMMERCIAL_LAW: "Commercial Contract Review",
  CRIMINAL_LAW: "Criminal Law Case",
  CIVIL_LAW: "Civil Law Case",
  IMMIGRATION_LAW: "Immigration Inquiry",
  CONSUMER_DISPUTE: "Consumer Dispute",
  OTHER: "Other Legal Matter",
};

export function getCategoryLabel(category: CaseCategory): string {
  return CASE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export function getSubcategoryLabel(
  subcategory: ImmigrationSubcategory,
): string {
  return (
    IMMIGRATION_SUBCATEGORIES.find((c) => c.value === subcategory)?.label ??
    subcategory
  );
}

export function generateCaseTitle(category: CaseCategory): string {
  return CASE_TITLE_BY_CATEGORY[category];
}

export function isImmigrationCategory(category: CaseCategory | undefined) {
  return category === "IMMIGRATION_LAW";
}
