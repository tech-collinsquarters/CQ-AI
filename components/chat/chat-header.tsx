"use client";

import { MoreHorizontal, Share2 } from "lucide-react";

import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCategoryLabel } from "@/constants/case-categories";
import { formatCaseDate } from "@/lib/format-date";
import type { CaseDto } from "@/types/case";

type ChatHeaderProps = {
  caseRecord: CaseDto;
};

export function ChatHeader({ caseRecord }: ChatHeaderProps) {
  const categoryLabel = caseRecord.intake
    ? getCategoryLabel(caseRecord.intake.category)
    : null;

  return (
    <header className="shrink-0 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="truncate text-base font-semibold tracking-tight md:text-lg">
            {caseRecord.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {categoryLabel ? (
              <>
                <span>{categoryLabel}</span>
                <Separator orientation="vertical" className="hidden h-3 sm:block" />
              </>
            ) : null}
            <span>Created {formatCaseDate(caseRecord.createdAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CaseStatusBadge status={caseRecord.status} />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="hidden gap-1.5 sm:inline-flex"
                  disabled
                  aria-label="Share case"
                />
              }
            >
              <Share2 className="size-3.5" aria-hidden />
              Share
            </TooltipTrigger>
            <TooltipContent>Sharing coming soon</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="More options"
                />
              }
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Export conversation</DropdownMenuItem>
              <DropdownMenuItem disabled>Case settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
