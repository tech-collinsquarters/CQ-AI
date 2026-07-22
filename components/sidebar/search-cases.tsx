"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { cn } from "@/lib/utils";

type SearchCasesProps = {
  collapsed?: boolean;
};

export function SearchCases({ collapsed = false }: SearchCasesProps) {
  const { caseSearchQuery, setCaseSearchQuery, setSelectedMenu } =
    useDashboardShell();

  if (collapsed) {
    return null;
  }

  return (
    <div className="relative px-3">
      <Search
        className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={caseSearchQuery}
        placeholder="Search cases…"
        className={cn(
          "h-9 bg-sidebar-accent/60 pl-9 text-sidebar-foreground placeholder:text-muted-foreground",
        )}
        aria-label="Search cases"
        onFocus={() => setSelectedMenu("search")}
        onChange={(event) => setCaseSearchQuery(event.target.value)}
      />
    </div>
  );
}
