"use client";

import { Sparkles } from "lucide-react";

import { SuggestedPrompts } from "@/components/chat/suggested-prompts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCategoryLabel,
  getSubcategoryLabel,
} from "@/constants/case-categories";
import type { CaseDto } from "@/types/case";

type ChatWelcomeCardProps = {
  caseRecord: CaseDto;
  onSelectPrompt: (prompt: string) => void;
};

export function ChatWelcomeCard({
  caseRecord,
  onSelectPrompt,
}: ChatWelcomeCardProps) {
  const intake = caseRecord.intake;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 md:py-14">
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="items-center gap-3 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-2xl bg-primary/10"
            aria-hidden
          >
            <Sparkles className="size-7 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="font-heading text-xl">
              Your case workspace is ready
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Ask questions about your legal matter. Counsel provides general
              legal information to help you prepare — it is not a substitute for
              advice from your solicitor.
            </CardDescription>
          </div>
        </CardHeader>

        {intake ? (
          <CardContent className="space-y-4">
            <dl className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 text-left text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Category
                </dt>
                <dd className="mt-1 font-medium">
                  {getCategoryLabel(intake.category)}
                </dd>
              </div>
              {intake.subcategory ? (
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Subcategory
                  </dt>
                  <dd className="mt-1 font-medium">
                    {getSubcategoryLabel(intake.subcategory)}
                  </dd>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Description
                </dt>
                <dd className="mt-1 leading-relaxed text-muted-foreground">
                  {intake.description}
                </dd>
              </div>
            </dl>
          </CardContent>
        ) : null}
      </Card>

      <div className="space-y-4">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Try asking
        </p>
        <SuggestedPrompts onSelect={onSelectPrompt} />
      </div>
    </div>
  );
}
