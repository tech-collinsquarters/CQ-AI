import type { CaseStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<CaseStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

const STATUS_VARIANTS: Record<
  CaseStatus,
  "default" | "secondary" | "outline"
> = {
  ACTIVE: "default",
  DRAFT: "outline",
  ARCHIVED: "secondary",
};

type CaseStatusBadgeProps = {
  status: CaseStatus;
  className?: string;
};

export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={cn(className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
