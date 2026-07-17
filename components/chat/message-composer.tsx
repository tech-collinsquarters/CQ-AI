"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CHAT_COMPOSER_PLACEHOLDER } from "@/constants/chat-prompts";
import { useChatInput } from "@/hooks/use-chat-input";
import { cn } from "@/lib/utils";

type MessageComposerProps = {
  onSend: (content: string) => void;
  disabled?: boolean;
  draft?: string;
  onDraftConsumed?: () => void;
  className?: string;
};

export function MessageComposer({
  onSend,
  disabled = false,
  draft,
  onDraftConsumed,
  className,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    value,
    setValue,
    charCount,
    isOverLimit,
    canSend,
    send,
    handleKeyDown,
    characterLimit,
  } = useChatInput({ onSend, disabled });

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
            disabled={disabled}
            rows={1}
            aria-label="Message input"
            className="max-h-[200px] min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
          />

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
        </div>

        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>Enter to send · Shift+Enter for new line</span>
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
