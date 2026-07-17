"use client";

import { WelcomeCard } from "@/components/workspace/welcome-card";
import { CasesOverview } from "@/components/workspace/cases-overview";
import { Skeleton } from "@/components/ui/skeleton";
import { useCases } from "@/hooks/use-cases";

export function DashboardWorkspace() {
  const { data: cases = [], isLoading } = useCases();

  if (isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <Skeleton className="h-80 w-full max-w-xl rounded-xl" />
      </section>
    );
  }

  if (cases.length === 0) {
    return (
      <section
        className="flex flex-1 items-center justify-center px-4 py-10"
        aria-label="Main workspace"
      >
        <WelcomeCard />
      </section>
    );
  }

  return <CasesOverview />;
}
