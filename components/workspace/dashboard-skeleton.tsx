import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <aside className="hidden w-64 flex-col border-r border-border p-3 md:flex">
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-2 h-9 w-full" />
        <Skeleton className="mb-2 h-9 w-full" />
        <Skeleton className="mb-2 h-9 w-full" />
        <Skeleton className="mt-auto h-16 w-full" />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <Skeleton className="h-72 w-full max-w-xl rounded-xl" />
        </div>
      </div>
    </div>
  );
}
