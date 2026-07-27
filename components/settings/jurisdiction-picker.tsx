"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  JURISDICTIONS,
  OTHER_JURISDICTION,
  isCustomJurisdiction,
} from "@/constants/jurisdictions";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile } from "@/lib/profile-client";

export const jurisdictionSelectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export type JurisdictionDraft = { selected: string; customText: string };

export function draftFromJurisdiction(
  jurisdiction: string | null | undefined,
): JurisdictionDraft {
  return isCustomJurisdiction(jurisdiction ?? null)
    ? { selected: OTHER_JURISDICTION, customText: jurisdiction ?? "" }
    : { selected: jurisdiction ?? "", customText: "" };
}

export function jurisdictionDraftValue(draft: JurisdictionDraft): string | null {
  const value =
    draft.selected === OTHER_JURISDICTION ? draft.customText.trim() : draft.selected;
  return value || null;
}

export function canSaveJurisdictionDraft(draft: JurisdictionDraft): boolean {
  return draft.selected !== OTHER_JURISDICTION || draft.customText.trim().length > 0;
}

/** Shared mutation for saving a jurisdiction - used by the profile page and the prompt dialog. */
export function useUpdateJurisdiction(onSuccess?: () => void) {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (jurisdiction: string | null) => updateProfile(jurisdiction),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Jurisdiction updated");
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

type JurisdictionPickerProps = {
  idPrefix: string;
  value: JurisdictionDraft;
  onChange: (draft: JurisdictionDraft) => void;
  disabled?: boolean;
};

/** Pure, controlled select + conditional "Other" free-text input - no state or mutation of its own. */
export function JurisdictionPicker({
  idPrefix,
  value,
  onChange,
  disabled = false,
}: JurisdictionPickerProps) {
  const isOther = value.selected === OTHER_JURISDICTION;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor={`${idPrefix}-select`}>Jurisdiction</Label>
        <select
          id={`${idPrefix}-select`}
          className={jurisdictionSelectClassName}
          value={value.selected}
          disabled={disabled}
          onChange={(event) =>
            onChange({ selected: event.target.value, customText: value.customText })
          }
        >
          <option value="">Not specified</option>
          {JURISDICTIONS.map((jurisdiction) => (
            <option key={jurisdiction.value} value={jurisdiction.value}>
              {jurisdiction.label}
            </option>
          ))}
        </select>
      </div>

      {isOther ? (
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-other`}>Specify jurisdiction</Label>
          <Input
            id={`${idPrefix}-other`}
            value={value.customText}
            disabled={disabled}
            placeholder="e.g. Ontario, Canada"
            onChange={(event) =>
              onChange({ selected: value.selected, customText: event.target.value })
            }
            maxLength={120}
          />
        </div>
      ) : null}
    </div>
  );
}
