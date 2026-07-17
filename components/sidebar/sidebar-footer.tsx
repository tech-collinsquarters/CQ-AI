"use client";

import Link from "next/link";
import { Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { cn } from "@/lib/utils";

type SidebarFooterProps = {
  collapsed?: boolean;
};

function getInitials(fullName?: string | null) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function SidebarFooter({ collapsed = false }: SidebarFooterProps) {
  const { user, loading } = useAuth();
  const { setSelectedMenu, setMobileNavOpen } = useDashboardShell();

  if (loading && !user) {
    return (
      <div
        className={cn(
          "space-y-2 border-t border-sidebar-border p-3",
          collapsed && "px-2",
        )}
      >
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  const profileClass = cn(
    buttonVariants({
      variant: "ghost",
      size: collapsed ? "icon" : "default",
    }),
    "w-full",
    !collapsed && "h-auto justify-start gap-2 py-2",
  );

  const settingsClass = cn(
    buttonVariants({
      variant: "ghost",
      size: collapsed ? "icon" : "default",
    }),
    "w-full",
    !collapsed && "justify-start gap-2",
  );

  return (
    <div className="border-t border-sidebar-border p-3">
      <div className="space-y-1">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/profile"
                  className={profileClass}
                  aria-label="Open profile"
                  onClick={() => {
                    setSelectedMenu("profile");
                    setMobileNavOpen(false);
                  }}
                />
              }
            >
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/profile"
            className={profileClass}
            aria-label="Open profile"
            onClick={() => {
              setSelectedMenu("profile");
              setMobileNavOpen(false);
            }}
          >
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-left">
              <span className="block truncate text-sm font-medium">
                {user?.fullName ?? "User"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </span>
          </Link>
        )}

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/settings"
                  className={settingsClass}
                  aria-label="Open settings"
                  onClick={() => {
                    setSelectedMenu("settings");
                    setMobileNavOpen(false);
                  }}
                />
              }
            >
              <Settings className="size-4" aria-hidden />
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/settings"
            className={settingsClass}
            aria-label="Open settings"
            onClick={() => {
              setSelectedMenu("settings");
              setMobileNavOpen(false);
            }}
          >
            <Settings className="size-4" aria-hidden />
            Settings
          </Link>
        )}
      </div>

      {!collapsed ? (
        <>
          <Separator className="my-3" />
          <p className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
            <User className="size-3" aria-hidden />
            Signed in as {user?.role ?? "USER"}
          </p>
        </>
      ) : null}
    </div>
  );
}
