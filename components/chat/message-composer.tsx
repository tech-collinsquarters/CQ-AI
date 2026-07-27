"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, ImagePlus, Loader2, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CHAT_COMPOSER_PLACEHOLDER } from "@/constants/chat-prompts";
import { useChatInput } from "@/hooks/use-chat-input";
import { uploadCaseFile } from "@/lib/case-files-client";
import { cn } from "@/lib/utils";
import type { ChatQuota } from "@/types/chat";

type MessageComposerProps = {
  caseId: string;
  onSend: (content: string) => void;
  onStop?: () => void;
  isGenerating?: boolean;
  quota?: ChatQuota | null;
  disabled?: boolean;
  draft?: string;
  onDraftConsumed?: () => void;
  className?: string;
};

export function MessageComposer({
  caseId,
  onSend,
  onStop,
  isGenerating = false,
  quota,
  disabled = false,
  draft,
  onDraftConsumed,
  className,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const quotaExhausted = Boolean(quota && quota.remaining <= 0);
  const effectiveDisabled = disabled || quotaExhausted;

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => uploadCaseFile(caseId, file),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ["case-files", caseId] });
      toast.success(
        `${file.fileName} added to case files — the assistant can see it on this and future messages.`,
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const {
    value,
    setValue,
    charCount,
    isOverLimit,
    canSend,
    send,
    handleKeyDown,
    characterLimit,
  } = useChatInput({ onSend, disabled: effectiveDisabled });

  useEffect(() => {
    if (draft !== undefined && draft !== "") {
      setValue(draft);
      onDraftConsumed?.();
      textareaRef.current?.focus();
    }
  }, [draft, onDraftConsumed, setValue]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={CHAT_COMPOSER_PLACEHOLDER}
            disabled={effectiveDisabled}
            rows={1}
            aria-label="Message input"
            className="max-h-[200px] min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
          />

          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                uploadImageMutation.mutate(file);
              }
            }}
          />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-xl"
                  disabled={disabled || uploadImageMutation.isPending}
                  onClick={() => imageInputRef.current?.click()}
                  aria-label="Attach an image"
                />
              }
            >
              {uploadImageMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="size-4" aria-hidden />
              )}
            </TooltipTrigger>
            <TooltipContent>
              Attach an image — added as case context, visible to the assistant on every message
            </TooltipContent>
          </Tooltip>

          {isGenerating ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-9 shrink-0 rounded-xl"
                    onClick={onStop}
                    aria-label="Stop generating"
                  />
                }
              >
                <Square className="size-3.5 fill-current" aria-hidden />
              </TooltipTrigger>
              <TooltipContent>Stop generating</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    className="size-9 shrink-0 rounded-xl"
                    disabled={!canSend}
                    onClick={send}
                    aria-label="Send message"
                  />
                }
              >
                <ArrowUp className="size-4" aria-hidden />
              </TooltipTrigger>
              <TooltipContent>
                {canSend ? "Send (Enter)" : "Enter a message to send"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>
            {quota && quota.remaining <= 0
              ? "Daily message limit reached — "
              : quota && quota.remaining <= 3
                ? `${quota.remaining} message${quota.remaining === 1 ? "" : "s"} left today — `
                : ""}
            {quota && quota.remaining <= 3 ? (
              <a
                href="/settings"
                className={cn(
                  "underline underline-offset-2",
                  quota.remaining <= 0
                    ? "font-medium text-destructive"
                    : "text-amber-600 dark:text-amber-500",
                )}
              >
                view plans
              </a>
            ) : (
              "Enter to send · Shift+Enter for new line"
            )}
          </span>
          <span
            className={cn(isOverLimit && "font-medium text-destructive")}
            aria-live="polite"
          >
            {charCount} / {characterLimit}
          </span>
        </div>
      </div>
    </div>
  );
}
