"use client";

import { AlertCircle, Bot, User } from "lucide-react";

import { CopyMessageButton } from "@/components/chat/copy-message-button";
import { MarkdownContent } from "@/components/chat/markdown-content";
import { MessageCitations } from "@/components/chat/message-citations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatMessageTimestamp } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isError = message.status === "error";
  const isStreaming = message.status === "streaming";

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

  const showCopy = message.content.length > 0 && !isStreaming;

  return (
    <article
      className={cn(
        "group/message flex gap-3 px-4 py-2",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
      aria-label={isUser ? "Your message" : "Assistant message"}
    >
      <Avatar size="sm" className="mt-1 shrink-0">
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
          "flex max-w-[min(100%,42rem)] min-w-0 flex-col gap-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : isError
                ? "border border-destructive/30 bg-destructive/5 text-foreground"
                : "border border-border bg-card text-foreground shadow-sm",
            isStreaming && "chat-message-streaming",
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
            <div className="relative">
              <MarkdownContent content={message.content} />
              {isStreaming ? (
                <span
                  className="chat-streaming-cursor ml-0.5 inline-block"
                  aria-hidden
                />
              ) : null}
            </div>
          )}

          {message.citations && message.citations.length > 0 ? (
            <MessageCitations citations={message.citations} />
          ) : null}
        </div>

        <div
          className={cn(
            "flex items-center gap-0.5 px-1",
            isUser && "flex-row-reverse",
          )}
        >
          <time
            dateTime={message.createdAt}
            className="text-[11px] text-muted-foreground tabular-nums"
          >
            {formatMessageTimestamp(message.createdAt)}
          </time>
          {showCopy ? (
            <CopyMessageButton
              content={message.content}
              className="opacity-100 sm:opacity-0 sm:group-hover/message:opacity-100 sm:focus-visible:opacity-100"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
