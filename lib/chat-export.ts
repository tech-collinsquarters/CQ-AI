import { getCategoryLabel } from "@/constants/case-categories";
import { formatCaseDate, formatMessageTimestamp } from "@/lib/format-date";
import type { CaseDto } from "@/types/case";
import type { ChatMessage } from "@/types/chat";

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "case";
}

export function exportFileName(caseRecord: CaseDto): string {
  return `${slugify(caseRecord.title)}.md`;
}

/** Renders a case's full conversation as a standalone Markdown document. */
export function buildChatMarkdown(
  caseRecord: CaseDto,
  messages: ChatMessage[],
): string {
  const lines: string[] = [`# ${caseRecord.title}`, ""];

  lines.push(`- Status: ${caseRecord.status}`);
  if (caseRecord.intake) {
    lines.push(`- Practice area: ${getCategoryLabel(caseRecord.intake.category)}`);
  }
  lines.push(`- Case opened: ${formatCaseDate(caseRecord.createdAt)}`);
  lines.push(
    `- Exported: ${formatCaseDate(new Date().toISOString())}`,
    "",
    "---",
    "",
  );

  for (const message of messages) {
    if (message.status === "error") {
      continue;
    }

    const speaker = message.role === "user" ? "Client" : "Counsel (AI)";
    lines.push(`### ${speaker} — ${formatMessageTimestamp(message.createdAt)}`, "");
    lines.push(message.content, "");

    if (message.citations && message.citations.length > 0) {
      lines.push("**Sources:**");
      for (const citation of message.citations) {
        lines.push(
          citation.url
            ? `- [${citation.title}](${citation.url})`
            : `- ${citation.title}`,
        );
      }
      lines.push("");
    }
  }

  lines.push(
    "---",
    "",
    "_General legal information only — not a substitute for advice from your solicitor._",
  );

  return lines.join("\n");
}

/** Triggers a browser download of `content` as a text file named `filename`. */
export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
