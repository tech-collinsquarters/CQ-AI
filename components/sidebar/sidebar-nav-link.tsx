"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sidebarNavItemClassName } from "@/components/sidebar/sidebar-nav-styles";
import { cn } from "@/lib/utils";

type SidebarNavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  collapsed?: boolean;
  external?: boolean;
  onClick?: () => void;
};

export function SidebarNavLink({
  href,
  label,
  icon: Icon,
  isActive = false,
  collapsed = false,
  external = false,
  onClick,
}: SidebarNavLinkProps) {
  const className = sidebarNavItemClassName({ isActive, collapsed });

  if (external) {
    const externalLink = (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={label}
        onClick={onClick}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        {!collapsed ? <span className="truncate">{label}</span> : null}
      </a>
    );

    if (!collapsed) {
      return externalLink;
    }

    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              aria-label={label}
              onClick={onClick}
            />
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden />
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  const link = (
    <Link
      href={href}
      className={className}
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={onClick}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            className={className}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            onClick={onClick}
          />
        }
      >
        <Icon className="size-4 shrink-0" aria-hidden />
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
