import { ExternalLink, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatCitation } from "@/types/chat";

type MessageCitationsProps = {
  citations: ChatCitation[];
  className?: string;
};

export function MessageCitations({
  citations,
  className,
}: MessageCitationsProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-4 border-t border-border/60 pt-3", className)}>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Sources
      </p>
      <ul className="flex flex-col gap-2">
        {citations.map((citation) => (
          <li key={citation.id}>
            {citation.url ? (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/50"
              >
                <FileText
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground group-hover:text-primary"
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <span className="truncate">{citation.title}</span>
                    <ExternalLink
                      className="size-3 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </span>
                  {citation.excerpt ? (
                    <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {citation.excerpt}
                    </span>
                  ) : null}
                </span>
              </a>
            ) : (
              <div className="flex gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <FileText
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {citation.title}
                  </span>
                  {citation.excerpt ? (
                    <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {citation.excerpt}
                    </span>
                  ) : null}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
