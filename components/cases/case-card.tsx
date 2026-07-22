"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { formatCaseDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { CaseListItem } from "@/types/case";

type CaseCardProps = {
  caseItem: CaseListItem;
  active?: boolean;
  compact?: boolean;
  /** "sidebar" uses sidebar color tokens instead of page background */
  variant?: "default" | "sidebar";
  onNavigate?: () => void;
};

export function CaseCard({
  caseItem,
  active = false,
  compact = false,
  variant = "default",
  onNavigate,
}: CaseCardProps) {
  const onSidebar = variant === "sidebar";

  return (
    <Link
      href={`/cases/${caseItem.id}`}
      onClick={onNavigate}
      className={cn(
        "block rounded-lg border px-3 py-2.5 transition-all duration-200",
        "hover:border-primary/30 hover:bg-sidebar-accent/50",
        active
          ? "border-primary/50 bg-primary/5 shadow-sm"
          : "border-transparent bg-transparent",
        compact && "px-2 py-2",
      )}
      aria-current={active ? "page" : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "line-clamp-2 text-sm font-medium",
            onSidebar ? "text-sidebar-foreground" : "text-foreground",
            compact && "text-[0.8rem]",
          )}
        >
          {caseItem.title}
        </p>
        <CaseStatusBadge status={caseItem.status} className="shrink-0" />
      </div>
      <p
        className={cn(
          "mt-1 text-xs",
          onSidebar ? "text-sidebar-foreground/60" : "text-muted-foreground",
        )}
      >
        {formatCaseDate(caseItem.createdAt)}
      </p>
    </Link>
  );
}

type CaseListProps = {
  cases: CaseListItem[];
  activeCaseId?: string;
  compact?: boolean;
  variant?: "default" | "sidebar";
  onNavigate?: () => void;
  className?: string;
};

export function CaseList({
  cases,
  activeCaseId,
  compact = false,
  variant = "default",
  onNavigate,
  className,
}: CaseListProps) {
  const pathname = usePathname();
  const resolvedActiveId =
    activeCaseId ??
    (pathname.startsWith("/cases/")
      ? pathname.split("/")[2]
      : undefined);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {cases.map((caseItem) => (
        <CaseCard
          key={caseItem.id}
          caseItem={caseItem}
          active={caseItem.id === resolvedActiveId}
          compact={compact}
          variant={variant}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
