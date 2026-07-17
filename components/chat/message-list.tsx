"use client";

import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import type { ChatMessage } from "@/types/chat";

type MessageListProps = {
  messages: ChatMessage[];
  isTyping?: boolean;
};

export function MessageList({ messages, isTyping = false }: MessageListProps) {
  return (
    <div className="flex flex-col" role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isTyping ? <TypingIndicator /> : null}
    </div>
  );
}
