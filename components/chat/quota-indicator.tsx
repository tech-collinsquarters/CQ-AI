"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { badgeVariants } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ChatQuota } from "@/types/chat";

type QuotaIndicatorProps = {
  quota: ChatQuota | null;
};

export function QuotaIndicator({ quota }: QuotaIndicatorProps) {
  if (!quota || quota.limit <= 0) {
    return null;
  }

  const percentUsed = (quota.used / quota.limit) * 100;
  const isExhausted = quota.remaining <= 0;
  const isNearLimit = !isExhausted && percentUsed >= 80;
  const needsAttention = isExhausted || isNearLimit;

  const badgeClassName = cn(
    badgeVariants({ variant: isExhausted ? "destructive" : "outline" }),
    "gap-1 text-xs",
    isNearLimit &&
      "border-amber-500 text-amber-600 dark:border-amber-500 dark:text-amber-500",
    needsAttention && "cursor-pointer hover:opacity-80",
  );

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          needsAttention ? (
            <Link href="/settings" className={badgeClassName} />
          ) : (
            <span className={badgeClassName} />
          )
        }
      >
        <MessageSquare className="size-3" aria-hidden />
        {quota.remaining} / {quota.limit} left today
      </TooltipTrigger>
      <TooltipContent>
        {isExhausted
          ? "Daily message limit reached — view plans"
          : isNearLimit
            ? "Getting close to today's limit — view plans"
            : `${quota.used} of ${quota.limit} messages used today`}
      </TooltipContent>
    </Tooltip>
  );
}
