"use client";

import { Bell, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import Link from "next/link";

import { ResponsiveDrawer } from "@/components/sidebar/responsive-drawer";
import { UserDropdown } from "@/components/navbar/user-dropdown";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { cn } from "@/lib/utils";

export function TopNavbar() {
  const { user, loading } = useAuth();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useDashboardShell();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-3 backdrop-blur supports-backdrop-filter:bg-background/70 md:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <ResponsiveDrawer />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebarCollapsed}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden />
          )}
        </Button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            Legal Assistant
          </p>
          {loading && !user ? (
            <Skeleton className="mt-1 h-3 w-28" />
          ) : (
            <p className="truncate text-xs text-muted-foreground">
              Welcome back, {user?.fullName?.split(" ")[0] ?? "there"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Notifications"
              />
            }
          >
            <Bell className="size-4" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Notifications coming soon</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/settings"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                aria-label="Settings"
              />
            }
          >
            <Settings className="size-4" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>

        <UserDropdown />
      </div>
    </header>
  );
}
