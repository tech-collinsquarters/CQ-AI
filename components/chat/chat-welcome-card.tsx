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
import { Separator } from "@/components/ui/separator";
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 md:py-12">
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="items-center text-center">
          <div
            className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10"
            aria-hidden
          >
            <Sparkles className="size-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Your case has been created successfully</CardTitle>
          <CardDescription className="text-base">
            Ask questions about your legal matter. Counsel provides general
            legal information to help you prepare — it is not a substitute for
            advice from your solicitor.
          </CardDescription>
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

      <div className="space-y-3">
        <Separator />
        <p className="text-center text-sm font-medium text-muted-foreground">
          Suggested prompts
        </p>
        <SuggestedPrompts onSelect={onSelectPrompt} />
      </div>
    </div>
  );
}
