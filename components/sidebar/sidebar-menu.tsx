"use client";

import Link from "next/link";
import {
  Home,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { cn } from "@/lib/utils";
import type { DashboardMenuId } from "@/types/dashboard";

type SidebarMenuProps = {
  collapsed?: boolean;
};

type MenuItem = {
  id: DashboardMenuId;
  label: string;
  href: string;
  icon: typeof Home;
  /** Opens href in a new tab as a plain anchor instead of client-side routing. */
  external?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "home", label: "Home", href: "/dashboard", icon: Home },
  { id: "profile", label: "Profile", href: "/profile", icon: User },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

const ADMIN_ITEM: MenuItem = {
  id: "admin",
  label: "Admin",
  href: "/admin",
  icon: ShieldCheck,
};

const CONTACT_ITEM: MenuItem = {
  id: "contact",
  label: "Contact us",
  href: "https://collinsquarters.com",
  icon: MessageCircleQuestion,
  external: true,
};

export function SidebarMenu({ collapsed = false }: SidebarMenuProps) {
  const { user } = useAuth();
  const { selectedMenu, setSelectedMenu, setMobileNavOpen } =
    useDashboardShell();

  const items = [
    ...MENU_ITEMS,
    ...(user?.role === "ADMIN" ? [ADMIN_ITEM] : []),
    CONTACT_ITEM,
  ];

  return (
    <nav aria-label="Primary" className="space-y-1 px-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = !item.external && selectedMenu === item.id;
        const className = cn(
          buttonVariants({
            variant: isActive ? "secondary" : "ghost",
            size: collapsed ? "icon" : "default",
          }),
          "w-full",
          !collapsed && "justify-start gap-2",
        );

        if (item.external) {
          const externalLink = (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              aria-label={item.label}
            >
              <Icon className="size-4" aria-hidden />
              {!collapsed ? item.label : null}
            </a>
          );

          if (!collapsed) {
            return externalLink;
          }

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger
                render={
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    aria-label={item.label}
                  />
                }
              >
                <Icon className="size-4" aria-hidden />
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        }

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
