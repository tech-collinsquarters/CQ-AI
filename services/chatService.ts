import type { ChatMessage as ChatMessageRecord } from "@prisma/client";
import { ChatRole } from "@prisma/client";

import { getPlanConfig } from "@/constants/plans";
import {
  buildCaseFileContentBlocks,
  converseStream,
  toConverseMessages,
} from "@/lib/ai/bedrock";
import { buildCaseContextPrompt, FIRM_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getPrisma } from "@/lib/prisma";
import { getCaseFilesWithBytes } from "@/services/caseFileService";
import type { AppUser } from "@/services/authService";
import type { CaseDto } from "@/types/case";
import type {
  ChatMessageDto,
  ChatQuota,
  ChatStreamEvent,
} from "@/types/chat";

export type { ChatMessageDto, ChatQuota, ChatStreamEvent };

/** How much prior conversation is replayed to the model each turn */
const HISTORY_MESSAGE_LIMIT = 40;
const MAX_RESPONSE_TOKENS = 8192;

function toDto(message: ChatMessageRecord): ChatMessageDto {
  return {
    id: message.id,
    role: message.role === ChatRole.USER ? "user" : "assistant",
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

function utcToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function listMessagesForCase(
  caseId: string,
): Promise<ChatMessageDto[]> {
  const messages = await getPrisma().chatMessage.findMany({
    where: { caseId },
    orderBy: { createdAt: "asc" },
  });
  return messages.map(toDto);
}

export async function getChatQuota(user: AppUser): Promise<ChatQuota> {
  const limit = getPlanConfig(user.plan).dailyMessageLimit;
  const usage = await getPrisma().dailyUsage.findUnique({
    where: { userId_day: { userId: user.id, day: utcToday() } },
  });
  const used = usage?.messageCount ?? 0;
  return { limit, used, remaining: Math.max(0, limit - used) };
}

async function recordMessageSent(userId: string): Promise<void> {
  const day = utcToday();
  await getPrisma().dailyUsage.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day, messageCount: 1 },
    update: { messageCount: { increment: 1 } },
  });
}

async function recordTokenUsage(
  userId: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  const day = utcToday();
  await getPrisma().dailyUsage.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day, inputTokens, outputTokens },
    update: {
      inputTokens: { increment: inputTokens },
      outputTokens: { increment: outputTokens },
    },
  });
}

/**
 * Persists the user message, streams the assistant reply from Bedrock,
 * persists the reply, and records usage. Yields UI-ready events.
 */
export async function* streamAssistantReply(options: {
  user: AppUser;
  caseRecord: CaseDto;
  content: string;
}): AsyncGenerator<ChatStreamEvent> {
  const { user, caseRecord, content } = options;
  const prisma = getPrisma();

  const userMessage = await prisma.chatMessage.create({
    data: { caseId: caseRecord.id, role: ChatRole.USER, content },
  });
  await recordMessageSent(user.id);
  yield { type: "user_message", message: toDto(userMessage) };

  try {
    const [history, caseFiles] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { caseId: caseRecord.id },
        orderBy: { createdAt: "desc" },
        take: HISTORY_MESSAGE_LIMIT,
      }),
      getCaseFilesWithBytes(caseRecord.id),
    ]);
    history.reverse();

    // Case knowledge files are re-sent as a synthetic leading user turn on
    // every request (not persisted to chat_messages) — Bedrock's Converse
    // `system` blocks are text-only, and a trailing cachePoint keeps repeat
    // turns from re-billing the file bytes as input tokens.
    const fileBlocks = buildCaseFileContentBlocks(
      caseFiles.map(({ file, bytes }) => ({
        fileName: file.fileName,
        mimeType: file.mimeType,
        bytes,
      })),
    );

    const messages = toConverseMessages(
      history.map((message) => ({
        role: message.role === ChatRole.USER ? "user" : "assistant",
        content: message.content,
      })),
    );
    if (fileBlocks.length > 0) {
      // Bedrock requires strict user/assistant alternation starting with a
      // user turn, so the file blocks are merged into the first user
      // message's content rather than inserted as a separate turn. The
      // cachePoint must be the very last block in the message — Bedrock
      // rejects any content block after it — so it's appended once the full
      // content (files + the turn's own text) is assembled, not between the
      // file blocks and the rest of the message.
      const cachePoint = { cachePoint: { type: "default" as const } };
      const firstMessage = messages[0];
      if (firstMessage?.role === "user") {
        firstMessage.content = [
          ...fileBlocks,
          ...(firstMessage.content ?? []),
          cachePoint,
        ];
      } else {
        messages.unshift({ role: "user", content: [...fileBlocks, cachePoint] });
      }
    }

    const response = await converseStream({
      system: [
        { text: FIRM_SYSTEM_PROMPT },
        { text: buildCaseContextPrompt(caseRecord, user.fullName) },
      ],
      messages,
      inferenceConfig: {
        maxTokens: MAX_RESPONSE_TOKENS,
        temperature: 0.3,
      },
    });

    let assistantText = "";
    let inputTokens = 0;
    let outputTokens = 0;

    if (response.stream) {
      for await (const event of response.stream) {
        const chunk = event.contentBlockDelta?.delta?.text;
        if (chunk) {
          assistantText += chunk;
          yield { type: "delta", text: chunk };
        }

        if (event.metadata?.usage) {
          inputTokens = event.metadata.usage.inputTokens ?? inputTokens;
          outputTokens = event.metadata.usage.outputTokens ?? outputTokens;
        }
      }
    }

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        caseId: caseRecord.id,
        role: ChatRole.ASSISTANT,
        content: assistantText,
        inputTokens,
        outputTokens,
      },
    });
    await recordTokenUsage(user.id, inputTokens, outputTokens);

    yield {
      type: "done",
      message: toDto(assistantMessage),
      quota: await getChatQuota(user),
    };
  } catch (error) {
    console.error("streamAssistantReply failed:", error);
    yield {
      type: "error",
      error:
        "The assistant could not complete a response. Please try again in a moment.",
    };
  }
}
