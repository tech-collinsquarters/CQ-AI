"use client";

import type { ReactNode } from "react";

import { FileText } from "lucide-react";

import { TopNavbar } from "@/components/navbar/top-navbar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { DashboardSkeleton } from "@/components/workspace/dashboard-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import {
  DashboardShellProvider,
  useDashboardShell,
} from "@/hooks/use-dashboard-shell";
import { RightPanelProvider, useRightPanel } from "@/hooks/use-right-panel";
import { cn } from "@/lib/utils";

function RightPanelEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
      <FileText className="size-6" aria-hidden />
      <p>Open a case to see its files and conversation summary here.</p>
    </div>
  );
}

function DashboardShellFrame({ children }: { children: ReactNode }) {
  const { sidebarCollapsed } = useDashboardShell();
  const { content: rightPanelContent } = useRightPanel();
  const { loading, user } = useAuth();

  if (loading && !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <div
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 md:flex",
          sidebarCollapsed ? "w-[4.25rem]" : "w-64",
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
          <aside
            className="hidden w-72 shrink-0 overflow-y-auto border-l border-border bg-muted/20 xl:block"
            aria-label="Sources panel"
          >
            {rightPanelContent ?? <RightPanelEmptyState />}
          </aside>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <DashboardShellProvider>
        <RightPanelProvider>
          <DashboardShellFrame>{children}</DashboardShellFrame>
        </RightPanelProvider>
      </DashboardShellProvider>
    </TooltipProvider>
  );
}
