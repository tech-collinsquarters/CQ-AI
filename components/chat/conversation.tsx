"use client";

import type { RefObject } from "react";

import { ChatWelcomeCard } from "@/components/chat/chat-welcome-card";
import { MessageList } from "@/components/chat/message-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CaseDto } from "@/types/case";
import type { ChatMessage } from "@/types/chat";

type ConversationProps = {
  caseRecord: CaseDto;
  messages: ChatMessage[];
  isTyping: boolean;
  onSelectPrompt: (prompt: string) => void;
  bottomRef: RefObject<HTMLDivElement | null>;
};

export function Conversation({
  caseRecord,
  messages,
  isTyping,
  onSelectPrompt,
  bottomRef,
}: ConversationProps) {
  const hasMessages = messages.length > 0;

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto w-full max-w-3xl">
        {hasMessages ? (
          <MessageList messages={messages} isTyping={isTyping} />
        ) : (
          <ChatWelcomeCard
            caseRecord={caseRecord}
            onSelectPrompt={onSelectPrompt}
          />
        )}
        <div ref={bottomRef} className="h-px" aria-hidden />
      </div>
    </ScrollArea>
  );
}
