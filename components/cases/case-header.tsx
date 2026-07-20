import { Scale } from "lucide-react";

import type { CaseDto } from "@/types/case";

import { CaseStatusBadge } from "./case-status-badge";
import { formatCaseDate } from "@/lib/format-date";
import {
  getCategoryLabel,
  getSubcategoryLabel,
} from "@/constants/case-categories";

type CaseHeaderProps = {
  caseRecord: CaseDto;
};

export function CaseHeader({ caseRecord }: CaseHeaderProps) {
  const intake = caseRecord.intake;

  return (
    <header className="space-y-4 border-b border-border pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Scale className="size-4" aria-hidden />
            <span className="text-xs font-medium tracking-wide uppercase">
              Case workspace
            </span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {caseRecord.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created {formatCaseDate(caseRecord.createdAt)}
          </p>
        </div>
        <CaseStatusBadge status={caseRecord.status} />
      </div>

      {intake ? (
        <dl className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Category
            </dt>
            <dd className="text-sm text-foreground">
              {getCategoryLabel(intake.category)}
            </dd>
          </div>
          {intake.subcategory ? (
            <div className="space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Subcategory
              </dt>
              <dd className="text-sm text-foreground">
                {getSubcategoryLabel(intake.subcategory)}
              </dd>
            </div>
          ) : null}
          <div className="space-y-1 sm:col-span-2">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Description
            </dt>
            <dd className="text-sm leading-relaxed text-foreground">
              {intake.description}
            </dd>
          </div>
        </dl>
      ) : null}
    </header>
  );
}
