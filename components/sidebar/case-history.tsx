"use client";

import Link from "next/link";
import { FolderPlus, History } from "lucide-react";

import { CaseList } from "@/components/cases/case-card";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarSectionLabel } from "@/components/sidebar/sidebar-section-label";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { useCases } from "@/hooks/use-cases";
import { cn } from "@/lib/utils";

type CaseHistoryProps = {
  collapsed?: boolean;
};

export function CaseHistory({ collapsed = false }: CaseHistoryProps) {
  const { data: cases = [], isLoading } = useCases();
  const { caseSearchQuery, setMobileNavOpen } = useDashboardShell();

  const query = caseSearchQuery.trim().toLowerCase();
  const filteredCases = query
    ? cases.filter((caseItem) =>
        caseItem.title.toLowerCase().includes(query),
      )
    : cases;

  if (collapsed) {
    return null;
  }

  return (
    <section
      className="mt-2 flex min-h-0 flex-1 flex-col gap-2 border-t border-sidebar-border px-3 pt-3"
      aria-labelledby="case-history-heading"
    >
      <SidebarSectionLabel
        id="case-history-heading"
        className="px-0 pt-0 pb-1"
      >
        Recent cases
      </SidebarSectionLabel>

      <ScrollArea className="min-h-0 flex-1 rounded-lg border border-sidebar-border bg-sidebar-accent/20">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-accent/80">
              <History className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-sidebar-foreground">
                {query ? "No matching cases" : "No cases yet"}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {query
                  ? "Try a different search term."
                  : "Create a case to start your legal workspace."}
              </p>
            </div>
            {!query ? (
              <Link
                href="/cases/new"
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "gap-1.5 border-sidebar-border bg-sidebar/50 hover:bg-sidebar-accent",
                )}
                onClick={() => setMobileNavOpen(false)}
              >
                <FolderPlus className="size-3.5" aria-hidden />
                New Case
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="p-1.5">
            <CaseList
              cases={filteredCases}
              compact
              variant="sidebar"
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        )}
      </ScrollArea>
    </section>
  );
}
