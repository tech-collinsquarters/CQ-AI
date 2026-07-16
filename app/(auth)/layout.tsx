import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">Loading…</div>}>
        {children}
      </Suspense>
    </div>
  );
}
