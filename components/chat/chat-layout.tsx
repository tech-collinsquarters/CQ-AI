"use client";

import { useCallback, useMemo, useState } from "react";

import { CasePanel } from "@/components/chat/case-panel";
import { ChatHeader } from "@/components/chat/chat-header";
import { Conversation } from "@/components/chat/conversation";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";
import { MessageComposer } from "@/components/chat/message-composer";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useRightPanelContent } from "@/hooks/use-right-panel";
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

  const { messages, isTyping, isBusy, isLoadingHistory, quota, sendMessage } =
    useChatMessages({ caseContext });
  const { bottomRef } = useAutoScroll<HTMLDivElement>([
    messages.length,
    messages[messages.length - 1]?.content.length ?? 0,
    isTyping,
  ]);

  const [promptDraft, setPromptDraft] = useState<string | undefined>();

  const handleSelectPrompt = useCallback((prompt: string) => {
    setPromptDraft(prompt);
  }, []);

  const clearPromptDraft = useCallback(() => {
    setPromptDraft(undefined);
  }, []);

  // Memoized so streaming message updates (which re-render this component on
  // every delta) don't keep replacing the panel content with a new element
  // reference — only an actual case change should do that.
  const casePanel = useMemo(
    () => <CasePanel caseRecord={caseRecord} />,
    [caseRecord],
  );
  useRightPanelContent(casePanel);

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
      <ChatHeader caseRecord={caseRecord} quota={quota} />

      {isLoadingHistory ? (
        <ConversationSkeleton />
      ) : (
        <Conversation
          caseRecord={caseRecord}
          messages={messages}
          isTyping={isTyping}
          onSelectPrompt={handleSelectPrompt}
          bottomRef={bottomRef}
        />
      )}

      <MessageComposer
        caseId={caseRecord.id}
        onSend={sendMessage}
        disabled={isBusy || isLoadingHistory}
        draft={promptDraft}
        onDraftConsumed={clearPromptDraft}
      />
    </div>
  );
}
