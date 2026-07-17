import type { CaseChatContext } from "@/types/chat";

/**
 * Placeholder assistant replies until Gemini/streaming is wired.
 * Replace this module with API/stream handler — UI stays unchanged.
 */
export function getDummyAssistantReply(
  userMessage: string,
  context?: CaseChatContext,
): string {
  const lower = userMessage.toLowerCase();
  const caseLabel = context?.caseTitle ?? "your case";

  if (
    lower.includes("legal process") ||
    lower.includes("how does") ||
    lower.includes("explain")
  ) {
    return `## Legal process overview

For **${caseLabel}**, the process typically follows these stages:

1. **Initial consultation** — We review your situation and identify the legal issues involved.
2. **Case assessment** — We outline options, timelines, and potential outcomes.
3. **Documentation** — You gather relevant records; we prepare filings or correspondence.
4. **Resolution** — Negotiation, mediation, or court proceedings as appropriate.

> This is general information only and does not constitute legal advice. A qualified solicitor will review your specific circumstances.

Would you like more detail on any of these steps?`;
  }

  if (
    lower.includes("services") ||
    lower.includes("firm provide") ||
    lower.includes("what do you")
  ) {
    return `## Our firm services

We provide full-service legal support including:

- **Case intake & strategy** — Structured assessment of your matter
- **Document review & drafting** — Contracts, notices, and court documents
- **Representation** — Advocacy in negotiations and proceedings
- **Ongoing counsel** — Updates as your case progresses

Your current matter is categorized under **${context?.category ?? "your selected practice area"}**.`;
  }

  if (
    lower.includes("document") ||
    lower.includes("prepare") ||
    lower.includes("bring")
  ) {
    return `## Documents to prepare

Depending on **${caseLabel}**, you may want to gather:

| Document type | Purpose |
|---------------|---------|
| Identity & contact records | Verification and correspondence |
| Contracts or agreements | Review of terms and obligations |
| Correspondence | Emails, letters related to the dispute |
| Financial records | If damages or payments are involved |
| Timeline notes | Key dates and events |

*Tip:* Organize files chronologically. When our AI module connects to your case, we can help you build a document checklist tailored to your intake.`;
  }

  if (
    lower.includes("how long") ||
    lower.includes("timeline") ||
    lower.includes("duration")
  ) {
    return `## Typical timelines

Timelines vary by matter type and complexity. For cases similar to yours:

- **Simple matters** — Often *4–8 weeks* for initial resolution steps
- **Moderate complexity** — *2–6 months* including documentation and negotiation
- **Complex or contested matters** — *6+ months* depending on court schedules

\`\`\`
Note: These are illustrative ranges only.
\`\`\`

We will provide a more accurate estimate once a solicitor reviews your full intake description.`;
  }

  return `Thank you for your question regarding **${caseLabel}**.

I've noted your inquiry:

> ${userMessage.trim().slice(0, 200)}${userMessage.length > 200 ? "…" : ""}

This is a **preview response**. When the AI module is connected, answers will be grounded in your case intake${context?.description ? " and firm knowledge base" : ""}.

In the meantime, try one of the suggested prompts above, or ask a more specific question about your matter.`;
}
