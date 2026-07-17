"use client";

import { AlertCircle, Bot, User } from "lucide-react";

import { MarkdownContent } from "@/components/chat/markdown-content";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isError = message.status === "error";

  if (isSystem) {
    return (
      <div
        className="flex justify-center px-4 py-2"
        role="status"
        aria-label="System message"
      >
        <p className="rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
      aria-label={isUser ? "Your message" : "Assistant message"}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback
          className={cn(
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {isUser ? (
            <User className="size-3.5" aria-hidden />
          ) : (
            <Bot className="size-3.5" aria-hidden />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[min(100%,42rem)] min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : isError
              ? "border border-destructive/30 bg-destructive/5 text-foreground"
              : "border border-border bg-card text-foreground shadow-sm",
        )}
      >
        {isError ? (
          <div className="mb-2 flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            <span className="text-xs font-medium">Unable to respond</span>
          </div>
        ) : null}

        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownContent content={message.content} />
        )}

        {message.citations && message.citations.length > 0 ? (
          <div className="mt-3 border-t border-border/60 pt-2">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Sources
            </p>
            <ul className="space-y-1">
              {message.citations.map((citation) => (
                <li key={citation.id} className="text-xs text-muted-foreground">
                  {citation.title}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
