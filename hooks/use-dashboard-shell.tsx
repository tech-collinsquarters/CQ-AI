"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getDashboardMenuIdFromPathname } from "@/lib/dashboard-nav";
import type { DashboardMenuId, DashboardShellState } from "@/types/dashboard";

type DashboardShellContextValue = DashboardShellState & {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setSelectedMenu: (menu: DashboardMenuId) => void;
  setCaseSearchQuery: (query: string) => void;
};

const DashboardShellContext =
  createContext<DashboardShellContextValue | null>(null);

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<DashboardMenuId>("home");
  const [caseSearchQuery, setCaseSearchQuery] = useState("");

  useEffect(() => {
    const menuId = getDashboardMenuIdFromPathname(pathname);
    if (menuId) {
      setSelectedMenu(menuId);
    }
  }, [pathname]);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const value = useMemo<DashboardShellContextValue>(
    () => ({
      sidebarCollapsed,
      mobileNavOpen,
      selectedMenu,
      caseSearchQuery,
      setSidebarCollapsed,
      toggleSidebarCollapsed,
      setMobileNavOpen,
      setSelectedMenu,
      setCaseSearchQuery,
    }),
    [
      sidebarCollapsed,
      mobileNavOpen,
      selectedMenu,
      caseSearchQuery,
      toggleSidebarCollapsed,
    ],
  );

  return (
    <DashboardShellContext.Provider value={value}>
      {children}
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  const context = useContext(DashboardShellContext);
  if (!context) {
    throw new Error(
      "useDashboardShell must be used within a DashboardShellProvider",
    );
  }
  return context;
}
