import Link from "next/link";
import { ArrowLeft, FolderPlus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NewCasePlaceholderPage() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 md:px-8">
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "w-fit gap-2",
        )}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <div
            className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted"
            aria-hidden
          >
            <FolderPlus className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>New Case</CardTitle>
          <CardDescription>
            Case creation is not implemented in this phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This page is a navigation placeholder so the dashboard shell can wire
          the New Case action. Intake and case records come next.
        </CardContent>
      </Card>
    </section>
  );
}
