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
import { buildChatMarkdown, downloadTextFile, exportFileName } from "@/lib/chat-export";
import type { CaseDto } from "@/types/case";
import type { CaseChatContext, ChatCitation } from "@/types/chat";

const SUMMARIZE_PROMPT =
  "Please summarize our conversation so far - key facts, decisions, and any open action items.";

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

  const {
    messages,
    isTyping,
    isBusy,
    isLoadingHistory,
    quota,
    searchingQuery,
    sendMessage,
    stopStreaming,
    retryMessage,
  } = useChatMessages({ caseContext });
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

  const citations = useMemo(() => {
    const byUrl = new Map<string, ChatCitation>();
    for (const message of messages) {
      for (const citation of message.citations ?? []) {
        if (!byUrl.has(citation.url ?? citation.id)) {
          byUrl.set(citation.url ?? citation.id, citation);
        }
      }
    }
    return [...byUrl.values()];
  }, [messages]);

  const casePanel = useMemo(
    () => <CasePanel caseRecord={caseRecord} citations={citations} />,
    [caseRecord, citations],
  );
  useRightPanelContent(casePanel);

  const handleSummarize = useCallback(() => {
    void sendMessage(SUMMARIZE_PROMPT);
  }, [sendMessage]);

  const handleExport = useCallback(() => {
    downloadTextFile(exportFileName(caseRecord), buildChatMarkdown(caseRecord, messages));
  }, [caseRecord, messages]);

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
      <ChatHeader
        caseRecord={caseRecord}
        quota={quota}
        onSummarize={isBusy || isLoadingHistory ? undefined : handleSummarize}
        onExport={messages.length > 0 ? handleExport : undefined}
      />

      {isLoadingHistory ? (
        <ConversationSkeleton />
      ) : (
        <Conversation
          caseRecord={caseRecord}
          messages={messages}
          isTyping={isTyping}
          typingLabel={
            searchingQuery
              ? `Searching the web for "${searchingQuery}"…`
              : undefined
          }
          onSelectPrompt={handleSelectPrompt}
          onRetry={retryMessage}
          bottomRef={bottomRef}
        />
      )}

      <MessageComposer
        caseId={caseRecord.id}
        onSend={sendMessage}
        onStop={stopStreaming}
        isGenerating={isTyping || isBusy}
        quota={quota}
        disabled={isBusy || isLoadingHistory}
        draft={promptDraft}
        onDraftConsumed={clearPromptDraft}
      />
    </div>
  );
}
