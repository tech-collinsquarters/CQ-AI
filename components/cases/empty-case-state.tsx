import { Bot } from "lucide-react";

export function EmptyCaseState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Bot className="size-8 text-primary" aria-hidden />
      </div>
      <h2 className="text-lg font-medium text-foreground">
        Your case workspace
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Open a case from the sidebar to view your conversation and case files
        here.
      </p>
    </div>
  );
}
