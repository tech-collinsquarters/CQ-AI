"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCaseMessages, streamChatMessage } from "@/lib/chat-client";
import type {
  CaseChatContext,
  ChatMessage,
  ChatMessageDto,
  ChatQuota,
} from "@/types/chat";

function toUiMessage(dto: ChatMessageDto): ChatMessage {
  return {
    id: dto.id,
    role: dto.role,
    content: dto.content,
    status: "sent",
    createdAt: dto.createdAt,
  };
}

function createLocalMessage(
  role: ChatMessage["role"],
  content: string,
  status: ChatMessage["status"] = "sent",
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status,
    createdAt: new Date().toISOString(),
  };
}

type UseChatMessagesOptions = {
  caseContext?: CaseChatContext;
};

/**
 * Loads persisted history for the case and streams assistant replies from
 * POST /api/cases/:id/chat (Claude on Amazon Bedrock).
 */
export function useChatMessages({ caseContext }: UseChatMessagesOptions = {}) {
  const caseId = caseContext?.caseId;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(Boolean(caseId));
  const [isTyping, setIsTyping] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [quota, setQuota] = useState<ChatQuota | null>(null);

  useEffect(() => {
    if (!caseId) {
      return;
    }

    let cancelled = false;

    fetchCaseMessages(caseId)
      .then(({ messages: history, quota: currentQuota }) => {
        if (cancelled) {
          return;
        }
        setMessages(history.map(toUiMessage));
        setQuota(currentQuota);
      })
      .catch((error: Error) => {
        console.error("Failed to load chat history:", error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !caseId) {
        return;
      }

      const optimisticUser = createLocalMessage("user", trimmed);
      const streamingId = crypto.randomUUID();
      let assistantStarted = false;

      setMessages((prev) => [...prev, optimisticUser]);
      setIsTyping(true);
      setIsBusy(true);

      const appendAssistantError = (message: string) => {
        const errorMessage = createLocalMessage("assistant", message, "error");
        errorMessage.errorMessage = message;
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== streamingId),
          errorMessage,
        ]);
      };

      try {
        await streamChatMessage(caseId, trimmed, (event) => {
          switch (event.type) {
            case "user_message":
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === optimisticUser.id ? toUiMessage(event.message) : m,
                ),
              );
              break;
            case "delta":
              if (!assistantStarted) {
                assistantStarted = true;
                setIsTyping(false);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: streamingId,
                    role: "assistant",
                    content: event.text,
                    status: "streaming",
                    createdAt: new Date().toISOString(),
                  },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId
                      ? { ...m, content: m.content + event.text }
                      : m,
                  ),
                );
              }
              break;
            case "done":
              setQuota(event.quota);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId ? toUiMessage(event.message) : m,
                ),
              );
              break;
            case "error":
              appendAssistantError(event.error);
              break;
          }
        });
      } catch (error) {
        appendAssistantError(
          error instanceof Error
            ? error.message
            : "Something went wrong while generating a response. Please try again.",
        );
      } finally {
        setIsTyping(false);
        setIsBusy(false);
      }
    },
    [caseId],
  );

  return {
    messages,
    isTyping,
    isBusy,
    isLoadingHistory,
    quota,
    sendMessage,
    hasMessages: messages.length > 0,
  };
}
