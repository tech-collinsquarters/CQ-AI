import { NextResponse } from "next/server";

import { FIRM_WEBSITE_URL } from "@/lib/ai/prompts";
import { getCurrentUser } from "@/services/authService";
import { getCaseForUser } from "@/services/caseService";
import {
  getChatQuota,
  reserveChatMessage,
  streamAssistantReply,
  type ChatStreamEvent,
} from "@/services/chatService";
import { sendChatMessageSchema } from "@/validators/chat";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

function toSseChunk(event: ChatStreamEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = sendChatMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid message" },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    const caseRecord = await getCaseForUser(user.id, id);

    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const reservedQuota = await reserveChatMessage(user);
    if (!reservedQuota) {
      const quota = await getChatQuota(user);
      return NextResponse.json(
        {
          error:
            `You have reached today's message limit for your plan. Upgrade your plan, try again tomorrow, or visit ${FIRM_WEBSITE_URL} to speak with our team.`,
          quota,
        },
        {
          status: 429,
          headers: { "Retry-After": "3600" },
        },
      );
    }

    const events = streamAssistantReply({
      user,
      caseRecord,
      content: parsed.data.content,
      signal: request.signal,
    });

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { value, done } = await events.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(toSseChunk(value));
        }
      },
      async cancel() {
        await events.return(undefined);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("POST /api/cases/[id]/chat failed:", error);
    return NextResponse.json(
      { error: "Unable to process message" },
      { status: 500 },
    );
  }
}
