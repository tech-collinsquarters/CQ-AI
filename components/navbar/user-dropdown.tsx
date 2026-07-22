"use client";

import Link from "next/link";
import { CircleHelp, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { PLAN_CONFIG } from "@/constants/plans";
import { useAuth } from "@/hooks/use-auth";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { cn } from "@/lib/utils";

const HELP_URL = "https://collinsquarters.com";

function getInitials(fullName?: string | null) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserDropdown() {
  const { user, loading, logout } = useAuth();
  const { data: usage } = usePlanUsage();

  const planLabel =
    usage?.planLabel ??
    (user?.plan ? PLAN_CONFIG[user.plan].label : "Free");

  if (loading && !user) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-full",
        )}
        aria-label="Open account menu"
      >
        <Avatar className="size-8">
          <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-10">
            <AvatarFallback className="text-sm">
              {getInitials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.fullName ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="px-2 pb-2">
          <Link
            href="/settings"
            className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-2.5 py-2 text-sm transition-colors hover:bg-muted/60"
          >
            <Badge variant="secondary" className="font-medium">
              {planLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">View usage</span>
          </Link>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2"
          nativeButton={false}
          render={<Link href="/profile" />}
        >
          <User className="size-4" aria-hidden />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2"
          nativeButton={false}
          render={<Link href="/settings" />}
        >
          <Settings className="size-4" aria-hidden />
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2"
          nativeButton={false}
          render={
            <a
              href={HELP_URL}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <CircleHelp className="size-4" aria-hidden />
          Help
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2"
          variant="destructive"
          disabled={loading}
          onClick={() => {
            void logout();
          }}
        >
          <LogOut className="size-4" aria-hidden />
          {loading ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
