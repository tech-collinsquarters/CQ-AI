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

/** Props passed to future AI layer — case context for system prompt */
export type CaseChatContext = {
  caseId: string;
  caseTitle: string;
  category?: string;
  subcategory?: string | null;
  description?: string;
};
