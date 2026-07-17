"use client";

import Link from "next/link";
import { Scale } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";

type SidebarHeaderProps = {
  collapsed?: boolean;
};

export function SidebarHeader({ collapsed = false }: SidebarHeaderProps) {
  const { setSelectedMenu, setMobileNavOpen } = useDashboardShell();

  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2 border-b border-sidebar-border px-3",
        collapsed && "justify-center px-2",
      )}
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Go to dashboard home"
        onClick={() => {
          setSelectedMenu("home");
          setMobileNavOpen(false);
        }}
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Scale className="size-4" aria-hidden />
        </span>
        {!collapsed ? (
          <span className="text-sm font-semibold tracking-tight">
            Legal Assistant
          </span>
        ) : null}
      </Link>
    </div>
  );
}
