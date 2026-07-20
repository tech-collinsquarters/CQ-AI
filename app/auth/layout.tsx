import { Suspense } from "react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <div className="flex justify-center pt-10 pb-2">
        <Image
          src="/logo.png"
          alt="Collins Quarters"
          width={1500}
          height={376}
          priority
          className="h-9 w-auto"
        />
      </div>
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
