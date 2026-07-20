import { z } from "zod";

export const sendChatMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(8000, "Message is too long (8000 characters max)"),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
