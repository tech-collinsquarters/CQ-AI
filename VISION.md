# CQ-AI — AI Law Firm Platform

CQ-AI is a client portal for a law firm where every client matter ("case") gets a
dedicated AI legal assistant. Clients register, describe their matter through a
guided intake, and then work with an assistant that is grounded in their case
context — explaining the law, preparing documents and questions, and setting
expectations — while the firm's solicitors stay the source of actual legal advice.

## Where we are today (implemented)

### Product flow
1. **Auth** — Supabase email auth, synced to a Prisma `User` row (`role`, `plan`).
2. **Case intake** — guided wizard (practice area → subcategory → description)
   creates a `Case` + `CaseIntake`.
3. **AI chat workspace** — per-case conversation with a real AI assistant,
   streamed token-by-token, with full history persisted per case.
4. **Case files (Claude-Projects style)** — images/PDFs/docs uploaded once
   per case via the right-hand panel become context for *every* message on
   that case (not per-message attachments). Backed by Supabase Storage,
   injected into each Bedrock turn as multimodal content blocks with prompt
   caching so repeat turns don't re-bill the bytes.
5. **Sources panel** — right-hand panel (desktop: always-visible aside;
   mobile: a header-triggered sheet) showing case files and an on-demand
   AI-generated conversation summary ("Summarize conversation").
6. **Cross-sell & contact** — the assistant naturally surfaces
   `FIRM_WEBSITE_URL` (collinsquarters.com) for consultations/urgent human
   help/other services; also linked from the sidebar and the quota-exceeded
   message.
7. **Admin console** — `/admin` (ADMIN role only): firm-wide stats, per-user
   role/plan management, a per-customer detail page (cases, 30-day usage,
   last-active tracking), and a CSV export of the customer list.

### AI layer (Claude on Amazon Bedrock)
- **SDK**: official `@anthropic-ai/bedrock-sdk` (`AnthropicBedrockMantle` —
  the Messages-API Bedrock client). No LangChain layer: for a single-agent chat
  with streaming, the direct SDK gives the same capability with fewer moving
  parts, and keeps a clean seam for tools/RAG later.
- **Model**: `anthropic.claude-opus-4-8` by default, overridable via
  `BEDROCK_MODEL_ID` (use `anthropic.claude-sonnet-5` to cut cost in dev).
- **System prompt** (`lib/ai/prompts.ts`):
  - a byte-stable firm persona block (marked `cache_control: ephemeral` so
    Bedrock prompt caching reuses it across all requests), covering role,
    plain-language explanations, jurisdiction handling, drafting rules,
    urgency escalation, refusal of unlawful help, privacy, and style;
  - a per-case context block built from the intake (practice area,
    subcategory, client's own description, status, client name).
- **Adaptive thinking** enabled; no sampling params (removed on Opus 4.7+).
- **Streaming**: SSE from `POST /api/cases/[id]/chat`
  (`user_message → delta* → done | error`), persisted on completion with
  input/output token counts.

### Data model additions
- `ChatMessage` (per case, role USER/ASSISTANT, content, token counts).
- `Plan` enum (`FREE`/`PRO`/`ENTERPRISE`) on `User`.
- `DailyUsage` (per user per UTC day: message count, input/output tokens) —
  powers quota enforcement and admin analytics.
- `CaseFile` (per case: image/document metadata + Supabase Storage path) —
  the case's persistent knowledge files, capped per plan by
  `maxCaseFiles`/`maxCaseFilesTotalBytes` in `constants/plans.ts`.
- `Case.summary` / `Case.summaryUpdatedAt` — the on-demand AI-generated
  conversation summary shown in the sources panel.
- `User.lastActiveAt` — touched (throttled to once per 10 min) on
  `getCurrentUser()`, powers the admin "last active" tracking.
- Migrations: `prisma/migrations/20260720090000_add_chat_plans_usage`,
  `prisma/migrations/20260720193000_add_case_files_and_tracking`
  (apply with `npx prisma migrate deploy` once `DIRECT_URL` is set).

### Monetization scaffolding (revenue-ready, not billed yet)
- Plan limits live in `constants/plans.ts`
  (FREE 20 / PRO 200 / ENTERPRISE 2000 messages per day).
- Quota enforced server-side in the chat route (429 with a friendly message).
- Admin can change a user's plan instantly from the console.
- Token usage is recorded per user per day — the raw data needed for
  cost attribution and future metered billing.

### Key files
| Area | Files |
|---|---|
| AI core | `lib/ai/bedrock.ts`, `lib/ai/prompts.ts`, `services/chatService.ts` |
| Chat API | `app/api/cases/[id]/chat/route.ts`, `app/api/cases/[id]/messages/route.ts` |
| Chat client | `lib/chat-client.ts`, `hooks/use-chat-messages.ts` |
| Case files | `services/caseFileService.ts`, `app/api/cases/[id]/files/**`, `lib/supabase/admin.ts`, `lib/case-files-client.ts`, `components/chat/case-panel.tsx` |
| Sources panel | `hooks/use-right-panel.tsx`, `components/workspace/dashboard-layout.tsx` (right `<aside>`), `components/chat/case-panel.tsx` |
| Chat summary | `services/caseSummaryService.ts`, `app/api/cases/[id]/summary/route.ts`, `lib/summary-client.ts` |
| Plans/quota | `constants/plans.ts`, `DailyUsage` model |
| Admin | `services/adminService.ts`, `app/api/admin/*`, `app/(shell)/admin/page.tsx`, `app/(shell)/admin/users/[userId]/page.tsx`, `components/admin/admin-dashboard.tsx`, `components/admin/customer-detail.tsx` |

### Environment
Supabase, `DATABASE_URL`/`DIRECT_URL`, AWS credentials + `AWS_REGION`,
`BEDROCK_MODEL_ID`, `FIRM_NAME` (default "Collins Quarters"), and
`FIRM_WEBSITE_URL` (default `https://collinsquarters.com`, surfaced by the
assistant and the app for cross-sell/contact). `SUPABASE_SERVICE_ROLE_KEY`
also backs the private `case-files` Storage bucket (auto-created on first
upload by `lib/supabase/admin.ts`).

### Operational notes
- The first ADMIN must be promoted manually (SQL:
  `update "User" set role = 'ADMIN' where email = '...';`) — after that, admins
  can promote others from the console.
- Bedrock model access must be enabled for the chosen model in the AWS console
  for the configured region.
- **`BEDROCK_MODEL_ID` currently points at `openai.gpt-oss-safeguard-120b`
  in `.env`** (not a Claude model). Case-file image/document injection and
  the persona/prompt-caching design assume a Claude model on Bedrock
  (`anthropic.claude-*`) — point it back at one before relying on file
  context or multimodal input in this environment.
- The root route file is `proxy.ts` (renamed from the deprecated
  `middleware.ts` — Next.js 16 renamed Middleware to Proxy).

## Roadmap / what to improve next

### Near term
- **Case-title generation** — after the first exchange, ask the model for a
  short title (replace the generic "Family Law Case #..." titles).
- **Quota UI** — surface remaining daily messages in the composer; upsell link
  when close to the limit (data already returned by both chat endpoints).
- **Retry / stop controls** — stop generation button (abort the fetch), retry
  failed turns.
- **Message pagination** — history endpoint currently returns all messages;
  paginate past ~200 messages.
- **Rate limiting / abuse** — per-IP limits on the chat route in addition to
  plan quotas.

### Product depth
- **RAG over firm knowledge** — embed firm playbooks, precedent letters, FAQ
  and jurisdiction guides; retrieve into the system prompt with citations
  (the `ChatCitation` type in `types/chat.ts` is already in place). Distinct
  from case files: this is firm-wide knowledge, not per-client uploads.
- ~~Document upload~~ — **done**: case-level image/document upload
  (`CaseFile`), injected into every turn as Bedrock multimodal content.
- **Auto-summary** — the summary is on-demand today (cost-conscious); revisit
  auto-refresh after each reply if usage shows it's worth the extra Bedrock
  call per turn.
- **Tool use** — give the assistant tools: create a document checklist saved to
  the case, book a consultation, escalate to a human solicitor (ticket/email).
- **Solicitor workspace** — internal view of a case: AI-generated matter
  summary, chronology, and suggested next actions for the assigned lawyer.
- **Multi-jurisdiction packs** — per-jurisdiction prompt addenda selected at
  intake.

### Revenue
- **Stripe integration** — checkout + customer portal; webhook maps Stripe
  subscription state → `User.plan`. The enforcement layer already reads
  `User.plan`, so billing is purely additive.
- **Metered/enterprise pricing** — token usage is already tracked per user/day;
  add monthly rollups and invoices for ENTERPRISE.
- **Trial mechanics** — FREE plan is the trial; consider first-case-free with
  per-case pricing as an alternative.

### Hardening
- Observability: structured logs around Bedrock calls (latency, tokens, errors),
  alerting on error rate.
- Evals: golden-set of legal questions per practice area; run on prompt/model
  changes to catch regressions.
- Compliance: retention policy for chat data, data-processing agreement
  language, and audit log of admin actions.
- Refusal handling: Opus can return a `refusal` stop reason; currently surfaced
  as a generic error — detect and show a tailored message.
