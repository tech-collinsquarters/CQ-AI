"use client";

import { MessageSquarePlus } from "lucide-react";

import { SUGGESTED_PROMPTS } from "@/constants/chat-prompts";
import { cn } from "@/lib/utils";

type SuggestedPromptsProps = {
  onSelect: (prompt: string) => void;
  className?: string;
};

export function SuggestedPrompts({ onSelect, className }: SuggestedPromptsProps) {
  return (
    <div
      className={cn("grid gap-2 sm:grid-cols-2", className)}
      role="group"
      aria-label="Suggested prompts"
    >
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className={cn(
            "flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm",
            "transition-colors hover:border-primary/40 hover:bg-muted/40",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
        >
          <MessageSquarePlus
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span>{prompt}</span>
        </button>
      ))}
    </div>
  );
}
