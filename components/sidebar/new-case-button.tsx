"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { isMenuItemActive } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type NewCaseButtonProps = {
  collapsed?: boolean;
};

export function NewCaseButton({ collapsed = false }: NewCaseButtonProps) {
  const pathname = usePathname();
  const { setSelectedMenu, setMobileNavOpen } = useDashboardShell();
  const isActive = isMenuItemActive("new-case", pathname);

  const link = (
    <Link
      href="/cases/new"
      className={cn(
        buttonVariants({ variant: isActive ? "secondary" : "default" }),
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
