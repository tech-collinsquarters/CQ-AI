"use client";

import { useCallback, useState } from "react";

import { getDummyAssistantReply } from "@/lib/chat-dummy";
import type { CaseChatContext, ChatMessage } from "@/types/chat";

const TYPING_DELAY_MS = 900;
const REPLY_DELAY_MS = 600;

function createMessage(
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
 * Local message state. Future: replace internals with useCaseChat(caseId)
 * calling POST /api/cases/:id/chat and streaming tokens into messages.
 */
export function useChatMessages({ caseContext }: UseChatMessagesOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      const userMessage = createMessage("user", trimmed);
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      await new Promise((resolve) => setTimeout(resolve, TYPING_DELAY_MS));

      try {
        const replyContent = getDummyAssistantReply(trimmed, caseContext);
        await new Promise((resolve) => setTimeout(resolve, REPLY_DELAY_MS));

        const assistantMessage = createMessage("assistant", replyContent);
        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage = createMessage(
          "assistant",
          "Something went wrong while generating a response. Please try again.",
          "error",
        );
        errorMessage.errorMessage = "Failed to generate preview response";
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [caseContext],
  );

  return {
    messages,
    isTyping,
    sendMessage,
    hasMessages: messages.length > 0,
  };
}
