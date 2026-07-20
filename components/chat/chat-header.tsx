"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, MoreHorizontal, Share2 } from "lucide-react";

import { CasePanel } from "@/components/chat/case-panel";
import { QuotaIndicator } from "@/components/chat/quota-indicator";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCategoryLabel } from "@/constants/case-categories";
import { fetchCaseFiles } from "@/lib/case-files-client";
import { formatCaseDate } from "@/lib/format-date";
import type { CaseDto } from "@/types/case";
import type { ChatQuota } from "@/types/chat";

type ChatHeaderProps = {
  caseRecord: CaseDto;
  quota?: ChatQuota | null;
};

export function ChatHeader({ caseRecord, quota }: ChatHeaderProps) {
  const categoryLabel = caseRecord.intake
    ? getCategoryLabel(caseRecord.intake.category)
    : null;

  // Same query key as CasePanel's files section, so this reuses the cache
  // instead of firing a second request.
  const filesQuery = useQuery({
    queryKey: ["case-files", caseRecord.id],
    queryFn: () => fetchCaseFiles(caseRecord.id),
  });
  const fileCount = filesQuery.data?.length ?? 0;

  return (
    <header className="shrink-0 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="truncate font-heading text-base font-semibold tracking-tight md:text-lg">
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
            <QuotaIndicator quota={quota ?? null} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CaseStatusBadge status={caseRecord.status} />

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative gap-1.5 xl:hidden"
                  aria-label="Case files and summary"
                />
              }
            >
              <FileText className="size-3.5" aria-hidden />
              Files
              {fileCount > 0 ? (
                <Badge
                  variant="secondary"
                  className="ml-0.5 h-4 min-w-4 justify-center px-1 text-[0.65rem]"
                >
                  {fileCount}
                </Badge>
              ) : null}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>Case files & summary</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <CasePanel caseRecord={caseRecord} />
              </div>
            </SheetContent>
          </Sheet>

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
