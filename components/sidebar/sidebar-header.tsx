"use client";

import Image from "next/image";
import Link from "next/link";

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
        {collapsed ? (
          <Image
            src="/logo-mark.png"
            alt="Collins Quarters"
            width={256}
            height={256}
            priority
            className="size-8"
          />
        ) : (
          <Image
            src="/logo.png"
            alt="Collins Quarters"
            width={1500}
            height={376}
            priority
            className="h-7 w-auto"
          />
        )}
      </Link>
    </div>
  );
}
