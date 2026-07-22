import { Suspense } from "react";
import Image from "next/image";

import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col overflow-y-auto bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_50%)]"
        aria-hidden
      />

      <div className="absolute top-3 right-3 z-50">
        <ThemeToggle className="bg-background/80 shadow-sm ring-1 ring-border/60 backdrop-blur" />
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-center gap-1 pt-6 pb-2">
        <Image
          src="/logo.png"
          alt="Collins Quarters"
          width={1500}
          height={376}
          priority
          className="h-8 w-auto"
        />
        <p className="text-[11px] text-muted-foreground">
          Counsel — your legal workspace
        </p>
      </div>

      <Suspense
        fallback={
          <div className="relative z-10 flex flex-1 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
            <Spinner />
            Loading…
          </div>
        }
      >
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </Suspense>
    </div>
  );
}
