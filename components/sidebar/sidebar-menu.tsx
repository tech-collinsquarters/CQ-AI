"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

import { SidebarNavLink } from "@/components/sidebar/sidebar-nav-link";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";
import { isMenuItemActive } from "@/lib/dashboard-nav";
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
  const pathname = usePathname();
  const { user } = useAuth();
  const { setSelectedMenu, setMobileNavOpen } = useDashboardShell();

  const items = [
    ...MENU_ITEMS,
    ...(user?.role === "ADMIN" ? [ADMIN_ITEM] : []),
    CONTACT_ITEM,
  ];

  const handleNavigate = (id: DashboardMenuId) => () => {
    setSelectedMenu(id);
    setMobileNavOpen(false);
  };

  return (
    <nav
      aria-label="Primary"
      className={cn("px-3 pb-2", collapsed ? "space-y-1" : "space-y-0.5")}
    >
      {items.map((item) => (
        <SidebarNavLink
          key={item.id}
          href={item.href}
          label={item.label}
          icon={item.icon}
          collapsed={collapsed}
          external={item.external}
          isActive={!item.external && isMenuItemActive(item.id, pathname)}
          onClick={
            item.external ? undefined : handleNavigate(item.id)
          }
        />
      ))}
    </nav>
  );
}
