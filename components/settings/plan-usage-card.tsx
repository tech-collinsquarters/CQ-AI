"use client";

import { MessageSquare, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { formatBytes } from "@/lib/utils";

function UsageRow({
  icon: Icon,
  label,
  used,
  limit,
  formatValue,
}: {
  icon: typeof MessageSquare;
  label: string;
  used: number;
  limit: number;
  formatValue: (n: number) => string;
}) {
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isNearLimit = percent >= 80;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
          {label}
        </span>
        <span
          className={isNearLimit ? "font-medium text-amber-600 dark:text-amber-500" : "text-foreground"}
        >
          {formatValue(used)} / {formatValue(limit)}
        </span>
      </div>
      <Progress value={percent}>
        <ProgressTrack>
          <ProgressIndicator
            className={isNearLimit ? "bg-amber-500" : undefined}
          />
        </ProgressTrack>
      </Progress>
    </div>
  );
}

export function PlanUsageCard() {
  const { data: usage, isLoading, isError } = usePlanUsage();

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  if (isError || !usage) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-destructive">
          Unable to load your plan usage.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your plan</CardTitle>
            <CardDescription>{usage.planDescription}</CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {usage.planLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <UsageRow
          icon={MessageSquare}
          label="Messages today"
          used={usage.messagesUsedToday}
          limit={usage.dailyMessageLimit}
          formatValue={(n) => n.toLocaleString()}
        />
        {/* File limits apply per case, so there's no single global "limit" to
            show a ratio against — this is informational, not a progress bar. */}
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="size-3.5" aria-hidden />
            Case files
          </span>
          <p className="text-sm">
            {usage.totalCaseFilesUsed.toLocaleString()} files (
            {formatBytes(usage.totalCaseFilesBytesUsed)}) across all your cases
          </p>
          <p className="text-xs text-muted-foreground">
            Each individual case may hold up to {usage.maxCaseFiles} files and{" "}
            {formatBytes(usage.maxCaseFilesTotalBytes)} total.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
