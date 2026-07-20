"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ContactUsDialog } from "@/components/chat/contact-us-dialog";
import { MarkdownContent } from "@/components/chat/markdown-content";
import { getPlanConfig } from "@/constants/plans";
import { useAuth } from "@/hooks/use-auth";
import { caseQueryKey } from "@/hooks/use-cases";
import {
  deleteCaseFile,
  fetchCaseFiles,
  uploadCaseFile,
} from "@/lib/case-files-client";
import { formatRelativeTime } from "@/lib/format-date";
import { generateCaseSummary } from "@/lib/summary-client";
import { cn } from "@/lib/utils";
import type { CaseDto } from "@/types/case";

type CasePanelProps = {
  caseRecord: CaseDto;
  className?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CasePanel({ caseRecord, className }: CasePanelProps) {
  return (
    <div className={cn("flex h-full flex-col divide-y divide-border", className)}>
      <CaseFilesSection caseId={caseRecord.id} />
      <CaseSummarySection caseRecord={caseRecord} />
      <div className="mt-auto p-4">
        <ContactUsDialog />
      </div>
    </div>
  );
}

function CaseFilesSection({ caseId }: { caseId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const filesQueryKey = ["case-files", caseId] as const;

  const filesQuery = useQuery({
    queryKey: filesQueryKey,
    queryFn: () => fetchCaseFiles(caseId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCaseFile(caseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => deleteCaseFile(caseId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const files = filesQuery.data ?? [];
  const plan = user ? getPlanConfig(user.plan) : null;
  const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);

  return (
    <section className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Files</h2>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Upload file"
          disabled={uploadMutation.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Upload className="size-3.5" aria-hidden />
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/markdown"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) {
              uploadMutation.mutate(file);
            }
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Added here, files become context for every message in this case —
        not attached to a single message.
      </p>

      {filesQuery.isLoading ? (
        <p className="text-xs text-muted-foreground">Loading files…</p>
      ) : files.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          No files yet. Upload images or documents for the assistant to use
          as reference.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {files.map((file) => {
            const Icon = file.kind === "IMAGE" ? ImageIcon : FileText;
            return (
              <li
                key={file.id}
                className="group flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-xs"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{file.fileName}</div>
                  <div className="text-muted-foreground">
                    {formatBytes(file.sizeBytes)}
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Remove ${file.fileName}`}
                  disabled={deleteMutation.isPending}
                  className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  onClick={() => deleteMutation.mutate(file.id)}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {plan ? (
        <p className="text-[0.7rem] text-muted-foreground">
          {files.length} / {plan.maxCaseFiles} files ·{" "}
          {formatBytes(totalBytes)} / {formatBytes(plan.maxCaseFilesTotalBytes)}
        </p>
      ) : null}
    </section>
  );
}

function CaseSummarySection({ caseRecord }: { caseRecord: CaseDto }) {
  const queryClient = useQueryClient();
  const [summary, setSummary] = useState(caseRecord.summary);
  const [summaryUpdatedAt, setSummaryUpdatedAt] = useState(
    caseRecord.summaryUpdatedAt,
  );

  const summarizeMutation = useMutation({
    mutationFn: () => generateCaseSummary(caseRecord.id),
    onSuccess: (result) => {
      setSummary(result.summary);
      setSummaryUpdatedAt(result.summaryUpdatedAt);
      queryClient.invalidateQueries({ queryKey: caseQueryKey(caseRecord.id) });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Summary</h2>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label={summary ? "Refresh summary" : "Summarize conversation"}
          disabled={summarizeMutation.isPending}
          onClick={() => summarizeMutation.mutate()}
        >
          {summarizeMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-3.5" aria-hidden />
          )}
        </Button>
      </div>

      {summary ? (
        <>
          <MarkdownContent content={summary} className="text-xs" />
          {summaryUpdatedAt ? (
            <p className="text-[0.7rem] text-muted-foreground">
              Updated {formatRelativeTime(summaryUpdatedAt)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          Generate a summary of this conversation&apos;s key points.
        </p>
      )}
    </section>
  );
}
