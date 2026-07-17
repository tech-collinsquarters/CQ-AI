import type { CaseCategory } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

import { CASE_CATEGORIES } from "@/constants/case-categories";
import { cn } from "@/lib/utils";

type CategoryCardProps = {
  value: CaseCategory;
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: (value: CaseCategory) => void;
};

export function CategoryCard({
  value,
  label,
  icon: Icon,
  selected,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
        "hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card",
      )}
      aria-pressed={selected}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg transition-colors",
            selected ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        {selected ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3" aria-hidden />
          </span>
        ) : null}
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}

type CategoryStepProps = {
  selected?: CaseCategory;
  onSelect: (value: CaseCategory) => void;
};

export function CategoryStep({ selected, onSelect }: CategoryStepProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CASE_CATEGORIES.map((category) => (
        <CategoryCard
          key={category.value}
          value={category.value}
          label={category.label}
          icon={category.icon}
          selected={selected === category.value}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
