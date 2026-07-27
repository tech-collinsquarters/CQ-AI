"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  JURISDICTIONS,
  OTHER_JURISDICTION,
  isCustomJurisdiction,
} from "@/constants/jurisdictions";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile } from "@/lib/profile-client";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

type JurisdictionDraft = { selected: string; customText: string };

function draftFromUser(jurisdiction: string | null): JurisdictionDraft {
  return isCustomJurisdiction(jurisdiction)
    ? { selected: OTHER_JURISDICTION, customText: jurisdiction ?? "" }
    : { selected: jurisdiction ?? "", customText: "" };
}

function JurisdictionCard() {
  const { user, refreshUser } = useAuth();
  // null = "not yet edited" — mirror the saved value from `user`. Set once
  // the client edits a field, and cleared back to null after a save so it
  // re-derives from the freshly-refreshed user.
  const [draft, setDraft] = useState<JurisdictionDraft | null>(null);

  const current = draft ?? draftFromUser(user?.jurisdiction ?? null);
  const { selected, customText } = current;

  const mutation = useMutation({
    mutationFn: (jurisdiction: string | null) => updateProfile(jurisdiction),
    onSuccess: async () => {
      await refreshUser();
      setDraft(null);
      toast.success("Jurisdiction updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const isOther = selected === OTHER_JURISDICTION;
  const canSave = !isOther || customText.trim().length > 0;

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    const value = isOther ? customText.trim() : selected;
    mutation.mutate(value || null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jurisdiction</CardTitle>
        <CardDescription>
          Tell the AI assistant which country or region&apos;s law applies to
          your matters, so it grounds its answers correctly by default.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {!user ? (
          <>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-8 w-24" />
          </>
        ) : (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="jurisdiction-select">Jurisdiction</Label>
              <select
                id="jurisdiction-select"
                className={selectClassName}
                value={selected}
                disabled={mutation.isPending}
                onChange={(event) =>
                  setDraft({ selected: event.target.value, customText })
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
                <Label htmlFor="jurisdiction-other">Specify jurisdiction</Label>
                <Input
                  id="jurisdiction-other"
                  value={customText}
                  disabled={mutation.isPending}
                  placeholder="e.g. Ontario, Canada"
                  onChange={(event) =>
                    setDraft({ selected, customText: event.target.value })
                  }
                  maxLength={120}
                />
              </div>
            ) : null}

            <div>
              <Button
                type="button"
                size="sm"
                disabled={!canSave || mutation.isPending}
                onClick={handleSave}
              >
                {mutation.isPending ? "Saving…" : "Save jurisdiction"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 md:px-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account details and session settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Your name and contact information on file with Collins Quarters.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          {loading && !user ? (
            <>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : (
            <>
              <div>
                <p className="text-muted-foreground">Full name</p>
                <p className="font-medium">{user?.fullName ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email ?? "—"}</p>
              </div>
              {user?.role === "ADMIN" ? (
                <div>
                  <p className="text-muted-foreground">Account type</p>
                  <p className="font-medium">Administrator</p>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <JurisdictionCard />

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Sign out of your account on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="gap-2 text-destructive"
            disabled={loading}
            onClick={() => void logout()}
          >
            <LogOut className="size-4" aria-hidden />
            {loading ? "Signing out…" : "Log out"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
