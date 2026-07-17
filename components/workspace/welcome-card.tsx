import Link from "next/link";
import { FolderPlus, Scale } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function WelcomeCard() {
  return (
    <Card className="w-full max-w-xl border-border/70 shadow-sm">
      <CardHeader className="items-center text-center">
        <div
          className="mb-2 flex size-16 items-center justify-center rounded-2xl bg-muted"
          aria-hidden
        >
          <Scale className="size-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">Welcome Back</CardTitle>
        <CardDescription className="text-base">
          Get Started With Your Case
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          You dont have any active legal cases. Click New Case to begin.
        </p>
        <div
          className="flex h-28 w-full max-w-sm items-center justify-center rounded-xl border border-dashed border-border bg-muted/40"
          role="img"
          aria-label="Illustration placeholder for empty workspace"
        >
          <FolderPlus className="size-10 text-muted-foreground/60" aria-hidden />
        </div>
        <Link
          href="/cases/new"
          className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        >
          <FolderPlus className="size-4" aria-hidden />
          New Case
        </Link>
      </CardContent>
    </Card>
  );
}
