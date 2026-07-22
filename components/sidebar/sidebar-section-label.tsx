import { cn } from "@/lib/utils";

type SidebarSectionLabelProps = {
  children: React.ReactNode;
  collapsed?: boolean;
  className?: string;
  id?: string;
};

export function SidebarSectionLabel({
  children,
  collapsed = false,
  className,
  id,
}: SidebarSectionLabelProps) {
  if (collapsed) {
    return null;
  }

  return (
    <p
      id={id}
      className={cn(
        "px-3 pt-1 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
