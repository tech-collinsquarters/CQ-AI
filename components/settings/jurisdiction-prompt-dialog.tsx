"use client";

import { useState } from "react";
import { Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  JurisdictionPicker,
  jurisdictionDraftValue,
  canSaveJurisdictionDraft,
  useUpdateJurisdiction,
  type JurisdictionDraft,
} from "@/components/settings/jurisdiction-picker";
import { useAuth } from "@/hooks/use-auth";

/**
 * Nudges the client to set their jurisdiction — Counsel can only ground
 * answers in the right country/region's law once this is known. Dismissible,
 * but reappears each fresh session (not persisted) until actually set.
 */
export function JurisdictionPromptDialog() {
  const { user, loading } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [draft, setDraft] = useState<JurisdictionDraft>({
    selected: "",
    customText: "",
  });

  const mutation = useUpdateJurisdiction();

  const open = !loading && Boolean(user) && !user?.jurisdiction && !dismissed;
  const canSave = canSaveJurisdictionDraft(draft);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setDismissed(true);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-brand-gold" aria-hidden />
            <DialogTitle>Set your jurisdiction</DialogTitle>
          </div>
          <DialogDescription>
            Counsel only knows which country or region&apos;s law to apply
            once you&apos;ve told it — set your jurisdiction now for
            accurate answers, or update it anytime from your profile.
          </DialogDescription>
        </DialogHeader>

        <JurisdictionPicker
          idPrefix="jurisdiction-prompt"
          value={draft}
          onChange={setDraft}
          disabled={mutation.isPending}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={mutation.isPending}
            onClick={() => setDismissed(true)}
          >
            Skip for now
          </Button>
          <Button
            type="button"
            disabled={!canSave || mutation.isPending}
            onClick={() => mutation.mutate(jurisdictionDraftValue(draft))}
          >
            {mutation.isPending ? "Saving…" : "Save jurisdiction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
