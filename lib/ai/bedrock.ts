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
        "AWS_REGION is not set. Add AWS_REGION (and AWS credentials) to .env.local — see .env.example.",
      );
    }
    globalForBedrock.bedrock = new BedrockRuntimeClient({ region: awsRegion });
  }
  return globalForBedrock.bedrock;
}

type ConverseStreamOptions = Omit<ConverseStreamCommandInput, "modelId">;

export function converseStream(options: ConverseStreamOptions) {
  return getBedrockClient().send(
    new ConverseStreamCommand({
      ...options,
      modelId: getBedrockModel(),
    }),
  );
}

type ConverseOptions = Omit<ConverseCommandInput, "modelId">;

/** One-shot (non-streaming) completion — used for short, single-turn tasks like summaries. */
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
 * meant to be sent as a synthetic leading user turn — Bedrock's Converse
 * `system` blocks are text-only, so multimodal case context has to live in
 * `messages` content instead.
 *
 * Does NOT include a trailing cachePoint — Bedrock requires cachePoint to be
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
