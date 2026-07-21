export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus = "sent" | "streaming" | "loading" | "error";

/** Future RAG: source references attached to assistant messages */
export type ChatCitation = {
  id: string;
  title: string;
  excerpt?: string;
  url?: string;
  documentId?: string;
};

/** Future: file or image attachments on messages */
export type ChatAttachment = {
  id: string;
  name: string;
  mimeType: string;
  url?: string;
  sizeBytes?: number;
};

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
  /** Populated when status is "error" */
  errorMessage?: string;
  citations?: ChatCitation[];
  attachments?: ChatAttachment[];
};

export type SendMessageInput = {
  content: string;
};

/** Server-persisted chat message as returned by the API */
export type ChatMessageDto = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

/** Daily message allowance for the current user's plan */
export type ChatQuota = {
  limit: number;
  used: number;
  remaining: number;
};

/** Events emitted over SSE by POST /api/cases/[id]/chat */
export type ChatStreamEvent =
  | { type: "user_message"; message: ChatMessageDto }
  | { type: "delta"; text: string }
  | { type: "done"; message: ChatMessageDto; quota: ChatQuota }
  | { type: "error"; error: string; quota?: ChatQuota }

/** Props passed to future AI layer — case context for system prompt */
export type CaseChatContext = {
  caseId: string;
  caseTitle: string;
  category?: string;
  subcategory?: string | null;
  description?: string;
};
