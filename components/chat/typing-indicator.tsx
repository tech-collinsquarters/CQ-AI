"use client";

import { cn } from "@/lib/utils";

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn("flex items-center gap-3 px-4 py-3", className)}
      role="status"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <div className="flex size-6 items-center justify-center rounded-full bg-muted">
        <span className="sr-only">Assistant is typing</span>
      </div>
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
