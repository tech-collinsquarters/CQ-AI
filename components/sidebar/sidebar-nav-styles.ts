import { cn } from "@/lib/utils";

type SidebarNavStyleOptions = {
  isActive?: boolean;
  collapsed?: boolean;
};

/** Shared nav row styles: hover surface + gold left accent when active. */
export function sidebarNavItemClassName({
  isActive = false,
  collapsed = false,
}: SidebarNavStyleOptions = {}) {
  return cn(
    "relative flex w-full items-center rounded-md text-sm font-medium transition-colors",
    "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
    collapsed ? "size-9 justify-center p-0" : "gap-2 px-2.5 py-2",
    isActive
      ? "bg-sidebar-accent text-sidebar-foreground"
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
    isActive &&
      "before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary",
  );
}

export function sidebarCaseItemClassName({ isActive = false } = {}) {
  return cn(
    "block rounded-md border border-transparent px-2.5 py-2 transition-colors duration-150",
    "hover:bg-sidebar-accent/70",
    isActive
      ? "border-sidebar-border bg-sidebar-accent/80 shadow-sm before:absolute before:top-1/2 before:left-0 before:h-8 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary"
      : "bg-transparent",
    "relative",
  );
}
