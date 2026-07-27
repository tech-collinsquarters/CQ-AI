import Link from "next/link";
import { FolderPlus, MessageSquare, Scale, Shield } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BENEFITS = [
  {
    icon: MessageSquare,
    text: "Ask questions and get clear explanations about your legal matter.",
  },
  {
    icon: FolderPlus,
    text: "Upload documents and keep everything organised in one place.",
  },
  {
    icon: Shield,
    text: "Private workspace for you and your solicitor at Collins Quarters.",
  },
] as const;

export function WelcomeCard() {
  return (
    <Card className="w-full max-w-xl border-border/70 shadow-sm">
      <CardHeader className="items-center text-center">
        <div
          className="mb-2 flex size-16 items-center justify-center rounded-2xl bg-primary/10"
          aria-hidden
        >
          <Scale className="size-8 text-primary" />
        </div>
        <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Start your first case to open your legal workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 text-center">
        <Link
          href="/cases/new"
          className={cn(buttonVariants({ size: "lg" }), "w-full max-w-sm gap-2")}
        >
          <FolderPlus className="size-4" aria-hidden />
          New Case
        </Link>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          You don't have any active cases yet. Create one to describe your
          legal matter and start working with Counsel.
        </p>

        <ul className="w-full max-w-md space-y-3 text-left text-sm text-muted-foreground">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-3.5 text-foreground" aria-hidden />
              </span>
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
