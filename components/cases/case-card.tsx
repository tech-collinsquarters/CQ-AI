"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Calendar } from "lucide-react";

import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { sidebarCaseItemClassName } from "@/components/sidebar/sidebar-nav-styles";
import { formatCaseDate, formatRelativeTime } from "@/lib/format-date";
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

  if (onSidebar) {
    return (
      <Link
        href={`/cases/${caseItem.id}`}
        onClick={onNavigate}
        className={cn(
          sidebarCaseItemClassName({ isActive: active }),
          compact && "px-2 py-2",
        )}
        aria-current={active ? "page" : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "line-clamp-2 text-sm font-medium text-sidebar-foreground",
              compact && "text-[0.8rem]",
            )}
          >
            {caseItem.title}
          </p>
          <CaseStatusBadge status={caseItem.status} className="shrink-0" />
        </div>
        <p className="mt-1 text-xs text-sidebar-foreground/60">
          {formatCaseDate(caseItem.createdAt)}
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={`/cases/${caseItem.id}`}
      onClick={onNavigate}
      className={cn(
        "group/case relative block rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 transition-all duration-200",
        "hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary/50 bg-primary/5 shadow-md ring-1 ring-primary/20"
          : null,
      )}
      aria-current={active ? "page" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">
              {caseItem.title}
            </h3>
            <CaseStatusBadge status={caseItem.status} className="shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden />
              Created {formatCaseDate(caseItem.createdAt)}
            </span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <span>{formatRelativeTime(caseItem.createdAt)}</span>
          </div>
        </div>

        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors",
            "group-hover/case:border-border group-hover/case:bg-background group-hover/case:text-foreground",
          )}
          aria-hidden
        >
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/case:translate-x-0.5" />
        </span>
      </div>
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
    <div
      className={cn(
        "flex flex-col",
        variant === "default" ? "gap-3" : "gap-1",
        className,
      )}
    >
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
