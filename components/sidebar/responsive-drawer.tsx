"use client";

import { PanelLeft } from "lucide-react";

import { Sidebar } from "@/components/sidebar/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDashboardShell } from "@/hooks/use-dashboard-shell";

export function ResponsiveDrawer() {
  const { mobileNavOpen, setMobileNavOpen } = useDashboardShell();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <PanelLeft className="size-4" aria-hidden />
      </Button>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-72 border-r border-sidebar-border bg-sidebar p-0"
          aria-describedby={undefined}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Sidebar collapsed={false} className="w-full" />
        </SheetContent>
      </Sheet>
    </>
  );
}
