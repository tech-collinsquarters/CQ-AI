"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sidebarNavItemClassName } from "@/components/sidebar/sidebar-nav-styles";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { isMenuItemActive } from "@/lib/dashboard-nav";
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
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { setSelectedMenu, setMobileNavOpen } = useDashboardShell();
  const isProfileActive = isMenuItemActive("profile", pathname);

  if (loading && !user) {
    return (
      <div
        className={cn(
          "border-t border-sidebar-border p-3",
          collapsed && "px-2",
        )}
      >
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  const profileClass = cn(
    sidebarNavItemClassName({ isActive: isProfileActive, collapsed }),
    !collapsed && "h-auto py-2",
  );

  const handleProfileClick = () => {
    setSelectedMenu("profile");
    setMobileNavOpen(false);
  };

  return (
    <div className="border-t border-sidebar-border p-3">
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/profile"
                className={profileClass}
                aria-current={isProfileActive ? "page" : undefined}
                aria-label="Open profile"
                onClick={handleProfileClick}
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
          aria-current={isProfileActive ? "page" : undefined}
          onClick={handleProfileClick}
        >
          <Avatar className="size-6 shrink-0">
            <AvatarFallback className="text-[10px]">
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 truncate text-left">
            <span className="block truncate text-sm font-medium">
              {user?.fullName ?? "User"}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </span>
        </Link>
      )}
    </div>
  );
}
