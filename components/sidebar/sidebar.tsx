"use client";

import { CaseHistory } from "@/components/sidebar/case-history";
import { NewCaseButton } from "@/components/sidebar/new-case-button";
import { SearchCases } from "@/components/sidebar/search-cases";
import { SidebarFooter } from "@/components/sidebar/sidebar-footer";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarMenu } from "@/components/sidebar/sidebar-menu";
import { SidebarSectionLabel } from "@/components/sidebar/sidebar-section-label";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed?: boolean;
  className?: string;
};

export function Sidebar({ collapsed = false, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
        collapsed ? "w-[4.25rem]" : "w-64",
        className,
      )}
      aria-label="Application sidebar"
    >
      <SidebarHeader collapsed={collapsed} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1 py-2">
          <SidebarSectionLabel collapsed={collapsed}>Workspace</SidebarSectionLabel>
          <div className="space-y-2 px-3">
            <NewCaseButton collapsed={collapsed} />
            <SearchCases collapsed={collapsed} />
          </div>

          <SidebarSectionLabel collapsed={collapsed} className="pt-3">
            Navigation
          </SidebarSectionLabel>
          <SidebarMenu collapsed={collapsed} />
        </div>

        {!collapsed ? <CaseHistory collapsed={collapsed} /> : null}
      </div>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
