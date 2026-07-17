import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Spinner />
            Loading…
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
