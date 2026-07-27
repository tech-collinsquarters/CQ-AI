"use client";

import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import type { ChatMessage } from "@/types/chat";

type MessageListProps = {
  messages: ChatMessage[];
  isTyping?: boolean;
  typingLabel?: string;
  onRetry?: (message: ChatMessage) => void;
};

export function MessageList({
  messages,
  isTyping = false,
  typingLabel,
  onRetry,
}: MessageListProps) {
  return (
    <div className="flex flex-col gap-1 py-2" role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onRetry={onRetry} />
      ))}
      {isTyping ? <TypingIndicator label={typingLabel} /> : null}
    </div>
  );
}
