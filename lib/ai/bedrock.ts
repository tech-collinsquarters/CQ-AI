import "server-only";

import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseStreamCommand,
  type ContentBlock,
  type ConverseCommandInput,
  type ConverseStreamCommandInput,
  type DocumentFormat,
  type ImageFormat,
  type Message,
  type Tool,
} from "@aws-sdk/client-bedrock-runtime";

import {
  DOCUMENT_MIME_TO_FORMAT,
  IMAGE_MIME_TO_FORMAT,
} from "@/validators/case-files";

/**
 * Amazon Bedrock via the Converse API (provider-agnostic).
 * Credentials resolve through the standard AWS chain:
 * AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars, shared profile, or role.
 */
const globalForBedrock = globalThis as unknown as {
  bedrock?: BedrockRuntimeClient;
};

export const DEFAULT_BEDROCK_MODEL = "anthropic.claude-opus-4-8";

export function getBedrockModel(): string {
  return process.env.BEDROCK_MODEL_ID || DEFAULT_BEDROCK_MODEL;
}

export function getBedrockClient(): BedrockRuntimeClient {
  if (!globalForBedrock.bedrock) {
    const awsRegion = process.env.AWS_REGION;
    if (!awsRegion) {
      throw new Error(
        "AWS_REGION is not set. Add AWS_REGION (and AWS credentials) to .env.local - see .env.example.",
      );
    }
    globalForBedrock.bedrock = new BedrockRuntimeClient({ region: awsRegion });
  }
  return globalForBedrock.bedrock;
}

type ConverseStreamOptions = Omit<ConverseStreamCommandInput, "modelId">;

export function converseStream(
  options: ConverseStreamOptions,
  abortSignal?: AbortSignal,
) {
  return getBedrockClient().send(
    new ConverseStreamCommand({
      ...options,
      modelId: getBedrockModel(),
    }),
    { abortSignal },
  );
}

export const WEB_SEARCH_TOOL_NAME = "web_search";

/**
 * Client-managed tool spec for live web search. Bedrock does not relay
 * Anthropic's hosted server-side web_search tool - this backend must execute
 * the search itself and hand results back as a tool result (see
 * chatService.streamAssistantReply's tool loop and lib/ai/web-search.ts).
 */
export function buildWebSearchTool(): Tool {
  return {
    toolSpec: {
      name: WEB_SEARCH_TOOL_NAME,
      description:
        "Search the live web for current information. Use only when the answer depends on something that may have changed recently (current fees, deadlines, whether a law or policy changed) - not for settled legal concepts or general explanations.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query.",
            },
          },
          required: ["query"],
        },
      },
    },
  };
}

type StreamBlockAccumulator =
  | { kind: "text"; text: string }
  | { kind: "toolUse"; toolUseId: string; name: string; inputJson: string };

export type ConverseStreamResult = {
  content: ContentBlock[];
  stopReason: string;
  inputTokens: number;
  outputTokens: number;
};

/**
 * Reads a ConverseStreamCommand response's event stream and reconstructs the
 * full assistant turn (text + any tool_use blocks). Yields each text delta
 * as it arrives - so the caller (chatService's generator) can forward it to
 * the client with no added latency - and returns the assembled `content`
 * once the stream ends, which must be replayed back to Bedrock as this
 * turn's message when continuing a tool-use loop.
 */
export async function* consumeConverseStream(
  response: Awaited<ReturnType<typeof converseStream>>,
): AsyncGenerator<string, ConverseStreamResult> {
  const blocks = new Map<number, StreamBlockAccumulator>();
  let stopReason = "end_turn";
  let inputTokens = 0;
  let outputTokens = 0;

  if (response.stream) {
    for await (const event of response.stream) {
      const start = event.contentBlockStart;
      if (start?.contentBlockIndex !== undefined && start.start?.toolUse) {
        blocks.set(start.contentBlockIndex, {
          kind: "toolUse",
          toolUseId: start.start.toolUse.toolUseId ?? "",
          name: start.start.toolUse.name ?? "",
          inputJson: "",
        });
      }

      const deltaEvent = event.contentBlockDelta;
      const index = deltaEvent?.contentBlockIndex;
      const delta = deltaEvent?.delta;
      if (index !== undefined && delta) {
        if (delta.text) {
          const existing = blocks.get(index);
          if (existing?.kind === "text") {
            existing.text += delta.text;
          } else {
            blocks.set(index, { kind: "text", text: delta.text });
          }
          yield delta.text;
        } else if (delta.toolUse?.input) {
          const existing = blocks.get(index);
          if (existing?.kind === "toolUse") {
            existing.inputJson += delta.toolUse.input;
          }
        }
      }

      if (event.messageStop?.stopReason) {
        stopReason = event.messageStop.stopReason;
      }

      if (event.metadata?.usage) {
        inputTokens = event.metadata.usage.inputTokens ?? inputTokens;
        outputTokens = event.metadata.usage.outputTokens ?? outputTokens;
      }
    }
  }

  const content: ContentBlock[] = [];
  for (const index of [...blocks.keys()].sort((a, b) => a - b)) {
    const block = blocks.get(index);
    if (!block) {
      continue;
    }
    if (block.kind === "text") {
      content.push({ text: block.text });
      continue;
    }
    let input: unknown = {};
    try {
      input = block.inputJson ? JSON.parse(block.inputJson) : {};
    } catch {
      input = {};
    }
    content.push({
      toolUse: {
        toolUseId: block.toolUseId,
        name: block.name,
        input: input as ContentBlock.ToolUseMember["toolUse"]["input"],
      },
    });
  }

  return { content, stopReason, inputTokens, outputTokens };
}

type ConverseOptions = Omit<ConverseCommandInput, "modelId">;

/** One-shot (non-streaming) completion - used for short, single-turn tasks like summaries. */
export async function converse(options: ConverseOptions): Promise<string> {
  const response = await getBedrockClient().send(
    new ConverseCommand({ ...options, modelId: getBedrockModel() }),
  );

  const message = response.output?.message;
  if (!message?.content) {
    return "";
  }

  return message.content
    .map((block) => ("text" in block ? block.text : undefined))
    .filter((text): text is string => Boolean(text))
    .join("");
}

export type ConverseHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export function toConverseMessages(history: ConverseHistoryMessage[]): Message[] {
  return history.map((message) => ({
    role: message.role,
    content: [{ text: message.content }],
  }));
}

export type CaseKnowledgeFile = {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
};

/**
 * DocumentBlock names may only contain alphanumerics, single spaces, hyphens,
 * parentheses, and square brackets (AWS rejects anything else, and warns the
 * field is otherwise vulnerable to prompt injection via the name itself).
 */
function sanitizeDocumentName(fileName: string): string {
  const cleaned = fileName
    .replace(/[^a-zA-Z0-9 ()[\]-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || "document").slice(0, 100);
}

/**
 * Builds the content blocks for a case's knowledge files (images/documents),
 * meant to be sent as a synthetic leading user turn - Bedrock's Converse
 * `system` blocks are text-only, so multimodal case context has to live in
 * `messages` content instead.
 *
 * Does NOT include a trailing cachePoint - Bedrock requires cachePoint to be
 * the very last block in the whole message, so the caller must append it
 * after merging these blocks with the rest of the message's content (see
 * chatService.streamAssistantReply).
 */
export function buildCaseFileContentBlocks(
  files: CaseKnowledgeFile[],
): ContentBlock[] {
  if (files.length === 0) {
    return [];
  }

  const blocks: ContentBlock[] = [
    {
      text: "The following files were provided by the client as reference material for this case:",
    },
  ];

  for (const file of files) {
    const imageFormat = IMAGE_MIME_TO_FORMAT[file.mimeType] as
      | ImageFormat
      | undefined;
    if (imageFormat) {
      blocks.push({
        image: { format: imageFormat, source: { bytes: file.bytes } },
      });
    } else {
      const format = documentFormatFromMimeType(file.mimeType);
      if (!format) {
        continue;
      }
      blocks.push({
        document: {
          format,
          name: sanitizeDocumentName(file.fileName),
          source: { bytes: file.bytes },
        },
      });
    }
  }

  return blocks;
}

function documentFormatFromMimeType(mimeType: string): DocumentFormat | null {
  return (DOCUMENT_MIME_TO_FORMAT[mimeType] as DocumentFormat) ?? null;
}
