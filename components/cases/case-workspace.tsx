"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ChatLayout } from "@/components/chat/chat-layout";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCase } from "@/hooks/use-cases";
import { cn } from "@/lib/utils";

type CaseWorkspaceProps = {
  caseId: string;
};

export function CaseWorkspace({ caseId }: CaseWorkspaceProps) {
  const { data: caseRecord, isLoading, isError } = useCase(caseId);

  if (isLoading) {
    return <ConversationSkeleton />;
  }

  if (isError || !caseRecord) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 md:px-8">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit gap-2")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to dashboard
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Case not found</CardTitle>
            <CardDescription>
              This case does not exist or you do not have access to it.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return <ChatLayout caseRecord={caseRecord} />;
}
