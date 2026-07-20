"use client";

import Link from "next/link";
import { FolderPlus } from "lucide-react";

import { CaseList } from "@/components/cases/case-card";
import { buttonVariants } from "@/components/ui/button";
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

export function CasesOverview() {
  const { data: cases = [], isLoading, isError } = useCases();

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10 md:px-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Unable to load cases</CardTitle>
            <CardDescription>
              Please refresh the page or try again in a moment.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Your cases
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a case to open its workspace or start a new intake.
          </p>
        </div>
        <Link
          href="/cases/new"
          className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        >
          <FolderPlus className="size-4" aria-hidden />
          New Case
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent cases</CardTitle>
          <CardDescription>
            {cases.length} case{cases.length === 1 ? "" : "s"} in your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CaseList cases={cases} />
        </CardContent>
      </Card>
    </section>
  );
}
