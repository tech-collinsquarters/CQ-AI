"use client";

import Link from "next/link";
import { Home, Settings } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { cn } from "@/lib/utils";
import type { DashboardMenuId } from "@/types/dashboard";

type SidebarMenuProps = {
  collapsed?: boolean;
};

const MENU_ITEMS: Array<{
  id: DashboardMenuId;
  label: string;
  href: string;
  icon: typeof Home;
}> = [
  { id: "home", label: "Home", href: "/dashboard", icon: Home },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export function SidebarMenu({ collapsed = false }: SidebarMenuProps) {
  const { selectedMenu, setSelectedMenu, setMobileNavOpen } =
    useDashboardShell();

  return (
    <nav aria-label="Primary" className="space-y-1 px-3">
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = selectedMenu === item.id;
        const className = cn(
          buttonVariants({
            variant: isActive ? "secondary" : "ghost",
            size: collapsed ? "icon" : "default",
          }),
          "w-full",
          !collapsed && "justify-start gap-2",
        );

        const link = (
          <Link
            key={item.id}
            href={item.href}
            className={className}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
            onClick={() => {
              setSelectedMenu(item.id);
              setMobileNavOpen(false);
            }}
          >
            <Icon className="size-4" aria-hidden />
            {!collapsed ? item.label : null}
          </Link>
        );

        if (!collapsed) {
          return link;
        }

        return (
          <Tooltip key={item.id}>
            <TooltipTrigger
              render={
                <Link
                  href={item.href}
                  className={className}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  onClick={() => {
                    setSelectedMenu(item.id);
                    setMobileNavOpen(false);
                  }}
                />
              }
            >
              <Icon className="size-4" aria-hidden />
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
