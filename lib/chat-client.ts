import type {
  ChatMessageDto,
  ChatQuota,
  ChatStreamEvent,
} from "@/types/chat";

async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function fetchCaseMessages(caseId: string): Promise<{
  messages: ChatMessageDto[];
  quota: ChatQuota;
}> {
  const response = await fetch(`/api/cases/${caseId}/messages`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await parseJson(response);
    throw new Error(
      typeof data.error === "string" ? data.error : "Unable to load messages",
    );
  }

  const data = await parseJson(response);
  return {
    messages: (data.messages ?? []) as ChatMessageDto[],
    quota: data.quota as ChatQuota,
  };
}

/**
 * Sends a message and consumes the SSE response, invoking `onEvent` for each
 * server event (user_message → delta* → done | error).
 */
export async function streamChatMessage(
  caseId: string,
  content: string,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`/api/cases/${caseId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
    signal,
  });

  if (!response.ok) {
    const data = await parseJson(response);
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Unable to send your message",
    );
  }

  if (!response.body) {
    throw new Error("Streaming is not supported in this browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flushFrame = (frame: string) => {
    for (const line of frame.split("\n")) {
      if (line.startsWith("data: ")) {
        try {
          onEvent(JSON.parse(line.slice(6)) as ChatStreamEvent);
        } catch {
          // Ignore malformed frames; the stream continues
        }
      }
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      flushFrame(buffer.slice(0, separatorIndex));
      buffer = buffer.slice(separatorIndex + 2);
      separatorIndex = buffer.indexOf("\n\n");
    }
  }

  if (buffer.trim()) {
    flushFrame(buffer);
  }
}
