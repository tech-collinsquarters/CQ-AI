import type {
  ContentBlock,
  ToolResultBlock,
} from "@aws-sdk/client-bedrock-runtime";
import type { ChatMessage as ChatMessageRecord } from "@prisma/client";
import { ChatRole } from "@prisma/client";

import { getPlanConfig } from "@/constants/plans";
import {
  buildCaseFileContentBlocks,
  buildWebSearchTool,
  consumeConverseStream,
  converseStream,
  toConverseMessages,
} from "@/lib/ai/bedrock";
import { buildCaseContextPrompt, FIRM_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { isWebSearchConfigured, searchWeb } from "@/lib/ai/web-search";
import { logError, logEvent } from "@/lib/logger";
import { getPrisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCaseFilesWithBytes } from "@/services/caseFileService";
import type { AppUser } from "@/services/authService";
import type { CaseDto } from "@/types/case";
import type {
  ChatCitation,
  ChatMessageDto,
  ChatQuota,
  ChatStreamEvent,
} from "@/types/chat";

export type { ChatMessageDto, ChatQuota, ChatStreamEvent };

/** How much prior conversation is replayed to the model each turn */
const HISTORY_MESSAGE_LIMIT = 40;
const MAX_RESPONSE_TOKENS = 8192;

/** Bounds the web-search tool loop — the last round always forces a final answer. */
const MAX_TOOL_ROUNDS = 3;
const WEB_SEARCH_RATE_LIMIT_MAX = 20;
const WEB_SEARCH_RATE_LIMIT_WINDOW_MS = 60 * 60_000;

function toDto(message: ChatMessageRecord): ChatMessageDto {
  return {
    id: message.id,
    role: message.role === ChatRole.USER ? "user" : "assistant",
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    citations: (message.citations as ChatCitation[] | null) ?? undefined,
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

/**
 * Atomically reserves one daily message. The conditional conflict update
 * prevents concurrent requests from exceeding a user's plan limit.
 */
export async function reserveChatMessage(user: AppUser): Promise<ChatQuota | null> {
  const day = utcToday();
  const limit = getPlanConfig(user.plan).dailyMessageLimit;
  const rows = await getPrisma().$queryRaw<Array<{ messageCount: number }>>`
    INSERT INTO "daily_usage" (
      "id", "userId", "day", "messageCount", "inputTokens", "outputTokens"
    )
    VALUES (gen_random_uuid(), ${user.id}::uuid, ${day}::date, 1, 0, 0)
    ON CONFLICT ("userId", "day") DO UPDATE
      SET "messageCount" = "daily_usage"."messageCount" + 1
      WHERE "daily_usage"."messageCount" < ${limit}
    RETURNING "messageCount"
  `;

  const used = rows[0]?.messageCount;
  if (used === undefined) {
    return null;
  }
  return { limit, used, remaining: Math.max(0, limit - used) };
}

/** Refunds one reserved message when Bedrock fails or the client disconnects. */
export async function releaseChatMessage(userId: string): Promise<void> {
  const day = utcToday();
  await getPrisma().$executeRaw`
    UPDATE "daily_usage"
    SET "messageCount" = GREATEST("messageCount" - 1, 0)
    WHERE "userId" = ${userId}::uuid AND "day" = ${day}::date
  `;
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
  signal?: AbortSignal;
}): AsyncGenerator<ChatStreamEvent> {
  const { user, caseRecord, content, signal } = options;
  const prisma = getPrisma();

  const userMessage = await prisma.chatMessage.create({
    data: { caseId: caseRecord.id, role: ChatRole.USER, content },
  });
  yield { type: "user_message", message: toDto(userMessage) };

  let assistantPersisted = false;
  let bedrockStartedAt = 0;

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

    const system = [
      { text: FIRM_SYSTEM_PROMPT },
      {
        text: buildCaseContextPrompt(
          caseRecord,
          user.fullName,
          user.jurisdiction,
        ),
      },
    ];
    const webSearchTool = isWebSearchConfigured() ? buildWebSearchTool() : null;

    let assistantText = "";
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    const citations: ChatCitation[] = [];
    const citedUrls = new Set<string>();

    bedrockStartedAt = Date.now();

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      // The final round drops the tool so the model must produce a real
      // answer instead of requesting yet another search.
      const isFinalRound = round === MAX_TOOL_ROUNDS - 1;

      const response = await converseStream(
        {
          system,
          messages,
          toolConfig:
            webSearchTool && !isFinalRound
              ? { tools: [webSearchTool] }
              : undefined,
          inferenceConfig: {
            maxTokens: MAX_RESPONSE_TOKENS,
            temperature: 0.3,
          },
        },
        signal,
      );

      const stream = consumeConverseStream(response);
      let next = await stream.next();
      while (!next.done) {
        assistantText += next.value;
        yield { type: "delta", text: next.value };
        next = await stream.next();
      }
      const result = next.value;
      totalInputTokens += result.inputTokens;
      totalOutputTokens += result.outputTokens;

      const toolUseBlocks = result.content.filter((block) => block.toolUse);

      if (result.stopReason !== "tool_use" || toolUseBlocks.length === 0) {
        break;
      }

      messages.push({ role: "assistant", content: result.content });

      const toolResultBlocks: ContentBlock[] = [];
      for (const block of toolUseBlocks) {
        const toolUse = block.toolUse;
        const query =
          toolUse?.input &&
          typeof toolUse.input === "object" &&
          "query" in toolUse.input
            ? String((toolUse.input as { query?: unknown }).query ?? "")
            : "";

        yield { type: "tool_start", tool: "web_search", query };

        const toolResult: ToolResultBlock = {
          toolUseId: toolUse?.toolUseId ?? "",
          content: [],
          status: "success",
        };

        const rateLimit = checkRateLimit(
          `web_search:${user.id}`,
          WEB_SEARCH_RATE_LIMIT_MAX,
          WEB_SEARCH_RATE_LIMIT_WINDOW_MS,
        );

        if (!rateLimit.allowed) {
          toolResult.status = "error";
          toolResult.content = [
            {
              text: "Web search is temporarily rate-limited for this account. Answer using what you already know, and tell the client you couldn't verify this against a live source right now.",
            },
          ];
        } else {
          try {
            const results = await searchWeb(query);
            if (results.length === 0) {
              toolResult.status = "error";
              toolResult.content = [
                { text: "No web search results were found for this query." },
              ];
            } else {
              toolResult.content = [
                {
                  // Bedrock's toolResult.content[].json field must be a JSON
                  // object, not a bare array — wrap the results.
                  json: {
                    results: results.map((r) => ({
                      title: r.title,
                      url: r.url,
                      content: r.content,
                    })),
                  },
                },
              ];
              for (const r of results) {
                if (!citedUrls.has(r.url)) {
                  citedUrls.add(r.url);
                  citations.push({
                    id: r.url,
                    title: r.title,
                    url: r.url,
                    excerpt: r.content.slice(0, 240),
                  });
                }
              }
            }
          } catch (searchError) {
            logError("web_search", searchError, {
              userId: user.id,
              caseId: caseRecord.id,
              query,
            });
            toolResult.status = "error";
            toolResult.content = [
              {
                text: "Web search failed. Answer using what you already know, and tell the client you couldn't verify this against a live source right now.",
              },
            ];
          }
        }

        toolResultBlocks.push({ toolResult });
      }

      messages.push({ role: "user", content: toolResultBlocks });
    }

    if (!assistantText.trim()) {
      throw new Error("Bedrock returned an empty assistant response");
    }

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        caseId: caseRecord.id,
        role: ChatRole.ASSISTANT,
        content: assistantText,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        citations: citations.length > 0 ? citations : undefined,
      },
    });
    await recordTokenUsage(user.id, totalInputTokens, totalOutputTokens);
    assistantPersisted = true;

    logEvent("bedrock.chat", {
      userId: user.id,
      caseId: caseRecord.id,
      latencyMs: Date.now() - bedrockStartedAt,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      searchesUsed: citedUrls.size,
    });

    yield {
      type: "done",
      message: toDto(assistantMessage),
      quota: await getChatQuota(user),
    };
  } catch (error) {
    if (!assistantPersisted) {
      await releaseChatMessage(user.id).catch((releaseError) =>
        console.error("releaseChatMessage failed:", releaseError),
      );
      await prisma.chatMessage
        .delete({ where: { id: userMessage.id } })
        .catch((deleteError) =>
          console.error("Failed to remove orphan user message:", deleteError),
        );
    }

    if (signal?.aborted) {
      return;
    }
    logError("bedrock.chat", error, {
      userId: user.id,
      caseId: caseRecord.id,
      latencyMs: bedrockStartedAt ? Date.now() - bedrockStartedAt : undefined,
    });
    yield {
      type: "error",
      error:
        "The assistant could not complete a response. Please try again in a moment.",
      quota: await getChatQuota(user),
    };
  }
}
