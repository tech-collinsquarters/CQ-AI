export type DashboardMenuId =
  | "home"
  | "new-case"
  | "search"
  | "history"
  | "settings"
  | "profile"
  | "admin"
  | "contact";

export type DashboardShellState = {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  selectedMenu: DashboardMenuId;
  /** Filters Case History in the sidebar */
  caseSearchQuery: string;
};
