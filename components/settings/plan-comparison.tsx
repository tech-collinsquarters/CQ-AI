"use client";

import { Check, MessageCircleQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_CONFIG, PLAN_ORDER } from "@/constants/plans";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { formatBytes } from "@/lib/utils";

const CONTACT_URL = "https://collinsquarters.com";

export function PlanComparison() {
  const { data: usage } = usePlanUsage();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {PLAN_ORDER.map((plan) => {
        const config = PLAN_CONFIG[plan];
        const isCurrent = usage?.plan === plan;

        return (
          <Card key={plan} className={isCurrent ? "border-primary" : undefined}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{config.label}</CardTitle>
                {isCurrent ? (
                  <Badge variant="default" className="text-xs">
                    Current plan
                  </Badge>
                ) : null}
              </div>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ul className="flex flex-col gap-1.5 text-sm">
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
                  {config.dailyMessageLimit.toLocaleString()} messages / day
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
                  Up to {config.maxCaseFiles} files per case
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
                  {formatBytes(config.maxCaseFilesTotalBytes)} of files per case
                </li>
              </ul>

              {!isCurrent ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 gap-1.5"
                  nativeButton={false}
                  render={
                    <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" />
                  }
                >
                  <MessageCircleQuestion className="size-3.5" aria-hidden />
                  Contact us to switch
                </Button>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
