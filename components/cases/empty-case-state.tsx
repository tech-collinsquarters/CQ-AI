import { Bot } from "lucide-react";

export function EmptyCaseState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Bot className="size-8 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="text-lg font-medium text-foreground">
        AI assistant coming soon
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Your AI Legal Assistant will appear here after the AI module is
        implemented.
      </p>
    </div>
  );
}
