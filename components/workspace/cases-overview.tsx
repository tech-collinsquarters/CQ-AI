"use client";

import Link from "next/link";
import { FolderPlus, RefreshCw } from "lucide-react";

import { CaseList } from "@/components/cases/case-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCases } from "@/hooks/use-cases";
import { cn } from "@/lib/utils";

function CasesOverviewSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-[4.5rem] w-full rounded-xl" />
        <Skeleton className="h-[4.5rem] w-full rounded-xl" />
        <Skeleton className="h-[4.5rem] w-full rounded-xl" />
      </div>
    </section>
  );
}

export function CasesOverview() {
  const { data: cases = [], isLoading, isError, refetch, isFetching } =
    useCases();

  if (isLoading) {
    return <CasesOverviewSkeleton />;
  }

  if (isError) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Unable to load cases</CardTitle>
            <CardDescription>
              Something went wrong loading your workspace. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw
                className={cn("size-4", isFetching && "animate-spin")}
                aria-hidden
              />
              Try again
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Your cases
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a case to open its workspace or start a new intake.
          </p>
        </div>
        <Link
          href="/cases/new"
          className={cn(buttonVariants({ size: "lg" }), "shrink-0 gap-2")}
        >
          <FolderPlus className="size-4" aria-hidden />
          New Case
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3 px-0.5">
          <h2 className="text-sm font-semibold text-foreground">Recent cases</h2>
          <p className="text-xs text-muted-foreground">
            {cases.length} case{cases.length === 1 ? "" : "s"}
          </p>
        </div>
        <CaseList cases={cases} />
      </div>
    </section>
  );
}
