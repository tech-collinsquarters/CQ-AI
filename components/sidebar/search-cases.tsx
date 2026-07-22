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
    return (
      <div className="flex justify-center px-2 py-1" aria-hidden>
        <Search className="size-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative px-3 py-1">
      <Search
        className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={caseSearchQuery}
        placeholder="Search cases…"
        className={cn(
          "h-9 bg-background pl-9 text-foreground placeholder:text-muted-foreground",
        )}
        aria-label="Search cases"
        onFocus={() => setSelectedMenu("search")}
        onChange={(event) => setCaseSearchQuery(event.target.value)}
      />
    </div>
  );
}
