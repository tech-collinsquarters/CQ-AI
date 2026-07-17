"use client";

import { useCallback, useState, type KeyboardEvent } from "react";

import { CHAT_CHARACTER_LIMIT } from "@/constants/chat-prompts";

type UseChatInputOptions = {
  onSend: (content: string) => void;
  disabled?: boolean;
};

export function useChatInput({ onSend, disabled = false }: UseChatInputOptions) {
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const charCount = value.length;
  const isOverLimit = charCount > CHAT_CHARACTER_LIMIT;
  const canSend =
    Boolean(trimmed) && !isOverLimit && !disabled;

  const send = useCallback(() => {
    if (!canSend) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }, [canSend, onSend, trimmed]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    },
    [send],
  );

  return {
    value,
    setValue,
    charCount,
    isOverLimit,
    canSend,
    send,
    handleKeyDown,
    characterLimit: CHAT_CHARACTER_LIMIT,
  };
}
