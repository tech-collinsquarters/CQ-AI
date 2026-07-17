"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { cn } from "@/lib/utils";

type NewCaseButtonProps = {
  collapsed?: boolean;
};

export function NewCaseButton({ collapsed = false }: NewCaseButtonProps) {
  const { setSelectedMenu, setMobileNavOpen } = useDashboardShell();

  const link = (
    <Link
      href="/cases/new"
      className={cn(
        buttonVariants({ variant: "default" }),
        "w-full justify-start gap-2",
        collapsed && "justify-center px-0",
      )}
      aria-label="Create a new case"
      onClick={() => {
        setSelectedMenu("new-case");
        setMobileNavOpen(false);
      }}
    >
      <Plus className="size-4" aria-hidden />
      {!collapsed ? "New Case" : null}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href="/cases/new"
            className={cn(
              buttonVariants({ variant: "default", size: "icon" }),
              "w-full",
            )}
            aria-label="Create a new case"
            onClick={() => {
              setSelectedMenu("new-case");
              setMobileNavOpen(false);
            }}
          />
        }
      >
        <Plus className="size-4" aria-hidden />
      </TooltipTrigger>
      <TooltipContent side="right">New Case</TooltipContent>
    </Tooltip>
  );
}
