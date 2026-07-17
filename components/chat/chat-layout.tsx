"use client";

import { useCallback, useMemo, useState } from "react";

import { ChatHeader } from "@/components/chat/chat-header";
import { Conversation } from "@/components/chat/conversation";
import { MessageComposer } from "@/components/chat/message-composer";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useChatMessages } from "@/hooks/use-chat-messages";
import {
  getCategoryLabel,
  getSubcategoryLabel,
} from "@/constants/case-categories";
import type { CaseDto } from "@/types/case";
import type { CaseChatContext } from "@/types/chat";

type ChatLayoutProps = {
  caseRecord: CaseDto;
};

export function ChatLayout({ caseRecord }: ChatLayoutProps) {
  const caseContext = useMemo<CaseChatContext>(
    () => ({
      caseId: caseRecord.id,
      caseTitle: caseRecord.title,
      category: caseRecord.intake
        ? getCategoryLabel(caseRecord.intake.category)
        : undefined,
      subcategory: caseRecord.intake?.subcategory
        ? getSubcategoryLabel(caseRecord.intake.subcategory)
        : null,
      description: caseRecord.intake?.description,
    }),
    [caseRecord],
  );

  const { messages, isTyping, sendMessage } = useChatMessages({ caseContext });
  const { bottomRef } = useAutoScroll<HTMLDivElement>([
    messages.length,
    isTyping,
  ]);

  const [promptDraft, setPromptDraft] = useState<string | undefined>();

  const handleSelectPrompt = useCallback((prompt: string) => {
    setPromptDraft(prompt);
  }, []);

  const clearPromptDraft = useCallback(() => {
    setPromptDraft(undefined);
  }, []);

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
      <ChatHeader caseRecord={caseRecord} />

      <Conversation
        caseRecord={caseRecord}
        messages={messages}
        isTyping={isTyping}
        onSelectPrompt={handleSelectPrompt}
        bottomRef={bottomRef}
      />

      <MessageComposer
        onSend={sendMessage}
        disabled={isTyping}
        draft={promptDraft}
        onDraftConsumed={clearPromptDraft}
      />
    </div>
  );
}
