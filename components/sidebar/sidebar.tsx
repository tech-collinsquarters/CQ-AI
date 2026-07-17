"use client";

import { CaseHistory } from "@/components/sidebar/case-history";
import { NewCaseButton } from "@/components/sidebar/new-case-button";
import { SearchCases } from "@/components/sidebar/search-cases";
import { SidebarFooter } from "@/components/sidebar/sidebar-footer";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMenu } from "@/components/sidebar/sidebar-menu";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed?: boolean;
  className?: string;
};

export function Sidebar({ collapsed = false, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
        collapsed ? "w-[4.25rem]" : "w-64",
        className,
      )}
      aria-label="Application sidebar"
    >
      <SidebarHeader collapsed={collapsed} />
      <div className="flex flex-col gap-3 py-3">
        <div className="px-3">
          <NewCaseButton collapsed={collapsed} />
        </div>
        <SearchCases collapsed={collapsed} />
        <SidebarMenu collapsed={collapsed} />
      </div>
      <CaseHistory collapsed={collapsed} />
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
