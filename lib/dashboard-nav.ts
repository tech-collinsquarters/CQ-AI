import type { DashboardMenuId } from "@/types/dashboard";

/** Maps the current URL to the sidebar menu item that should appear active. */
export function getDashboardMenuIdFromPathname(
  pathname: string,
): DashboardMenuId | null {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return "home";
  }
  if (pathname === "/cases/new" || pathname.startsWith("/cases/new/")) {
    return "new-case";
  }
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return "profile";
  }
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return "settings";
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return "admin";
  }
  return null;
}

export function isCaseWorkspacePath(pathname: string): boolean {
  return /^\/cases\/(?!new(?:\/|$))[^/]+$/.test(pathname);
}

export function isMenuItemActive(
  itemId: DashboardMenuId,
  pathname: string,
): boolean {
  return getDashboardMenuIdFromPathname(pathname) === itemId;
}
