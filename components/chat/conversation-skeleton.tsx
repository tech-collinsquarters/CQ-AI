import { Skeleton } from "@/components/ui/skeleton";

export function ConversationSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-8">
        <Skeleton className="mx-auto h-48 w-full max-w-2xl rounded-xl" />
        <Skeleton className="mx-auto h-24 w-full max-w-2xl rounded-xl" />
        <div className="mx-auto mt-auto w-full max-w-3xl space-y-4">
          <div className="flex justify-end gap-3">
            <Skeleton className="h-16 w-2/3 rounded-2xl" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-24 w-3/4 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-4 py-3">
        <Skeleton className="mx-auto h-14 w-full max-w-3xl rounded-2xl" />
      </div>
    </div>
  );
}
