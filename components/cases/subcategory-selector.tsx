import type { ImmigrationSubcategory } from "@prisma/client";
import { Check } from "lucide-react";

import { IMMIGRATION_SUBCATEGORIES } from "@/constants/case-categories";
import { cn } from "@/lib/utils";

type SubcategorySelectorProps = {
  selected?: ImmigrationSubcategory | null;
  onSelect: (value: ImmigrationSubcategory) => void;
};

export function SubcategorySelector({
  selected,
  onSelect,
}: SubcategorySelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {IMMIGRATION_SUBCATEGORIES.map((option) => {
        const isSelected = selected === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
              "hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isSelected
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card text-foreground",
            )}
            aria-pressed={isSelected}
          >
            {option.label}
            {isSelected ? (
              <Check className="size-4 text-primary" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
