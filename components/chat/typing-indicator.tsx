"use client";

import { Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn("flex items-start gap-3 px-4 py-2", className)}
      role="status"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <Avatar size="sm" className="mt-1 shrink-0">
        <AvatarFallback className="bg-muted">
          <Bot className="size-3.5" aria-hidden />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
        <span className="sr-only">Assistant is typing</span>
        <span className="chat-typing-dot size-1.5 rounded-full bg-muted-foreground/70" />
        <span className="chat-typing-dot size-1.5 rounded-full bg-muted-foreground/70 [animation-delay:160ms]" />
        <span className="chat-typing-dot size-1.5 rounded-full bg-muted-foreground/70 [animation-delay:320ms]" />
      </div>
    </div>
  );
}
