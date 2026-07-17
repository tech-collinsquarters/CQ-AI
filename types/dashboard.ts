export type DashboardMenuId =
  | "home"
  | "new-case"
  | "search"
  | "history"
  | "settings"
  | "profile";

export type DashboardShellState = {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  selectedMenu: DashboardMenuId;
};
