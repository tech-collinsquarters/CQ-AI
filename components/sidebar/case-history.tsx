"use client";

import { FolderOpen, History } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type CaseHistoryProps = {
  collapsed?: boolean;
};

export function CaseHistory({ collapsed = false }: CaseHistoryProps) {
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

      <ScrollArea className="min-h-0 flex-1 rounded-lg border border-dashed border-sidebar-border bg-sidebar/40">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 px-4 py-10 text-center",
          )}
        >
          <FolderOpen
            className="size-8 text-muted-foreground/70"
            aria-hidden
          />
          <p className="text-sm font-medium text-foreground">No cases yet.</p>
          <p className="max-w-[14rem] text-xs text-muted-foreground">
            Create your first case to start organizing legal work.
          </p>
        </div>
      </ScrollArea>
    </section>
  );
}
