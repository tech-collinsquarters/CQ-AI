"use client";

import { History } from "lucide-react";

import { CaseList } from "@/components/cases/case-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { useCases } from "@/hooks/use-cases";
import { cn } from "@/lib/utils";

type CaseHistoryProps = {
  collapsed?: boolean;
};

export function CaseHistory({ collapsed = false }: CaseHistoryProps) {
  const { data: cases = [], isLoading } = useCases();
  const { setMobileNavOpen } = useDashboardShell();

  if (collapsed) {
    return (
      <div
        className="flex flex-1 flex-col items-center gap-2 px-2 py-4"
        aria-label="Case history"
      >
        <History className="size-4 text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <section
      className="flex min-h-0 flex-1 flex-col gap-2 px-3"
      aria-labelledby="case-history-heading"
    >
      <div className="flex items-center gap-2 px-1">
        <History className="size-3.5 text-muted-foreground" aria-hidden />
        <h2
          id="case-history-heading"
          className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          Case History
        </h2>
      </div>

      <ScrollArea className="min-h-0 flex-1 rounded-lg border border-sidebar-border bg-sidebar/40">
        {isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : cases.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 px-4 py-10 text-center",
            )}
          >
            <p className="text-sm font-medium text-sidebar-foreground">
              No cases yet.
            </p>
            <p className="max-w-[14rem] text-xs text-sidebar-foreground/60">
              Create your first case to start organizing legal work.
            </p>
          </div>
        ) : (
          <div className="p-2">
            <CaseList
              cases={cases}
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
