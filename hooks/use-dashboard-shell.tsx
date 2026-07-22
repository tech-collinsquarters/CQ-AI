"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<DashboardMenuId>("home");
  const [caseSearchQuery, setCaseSearchQuery] = useState("");

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
