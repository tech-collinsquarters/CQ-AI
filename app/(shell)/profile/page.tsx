"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  JurisdictionPicker,
  draftFromJurisdiction,
  jurisdictionDraftValue,
  canSaveJurisdictionDraft,
  useUpdateJurisdiction,
  type JurisdictionDraft,
} from "@/components/settings/jurisdiction-picker";
import { useAuth } from "@/hooks/use-auth";

function JurisdictionCard() {
  const { user } = useAuth();
  // null = "not yet edited" — mirror the saved value from `user`. Set once
  // the client edits a field, and cleared back to null after a save so it
  // re-derives from the freshly-refreshed user.
  const [draft, setDraft] = useState<JurisdictionDraft | null>(null);

  const current = draft ?? draftFromJurisdiction(user?.jurisdiction);
  const mutation = useUpdateJurisdiction(() => setDraft(null));
  const canSave = canSaveJurisdictionDraft(current);

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
            <JurisdictionPicker
              idPrefix="jurisdiction"
              value={current}
              onChange={setDraft}
              disabled={mutation.isPending}
            />
            <div>
              <Button
                type="button"
                size="sm"
                disabled={!canSave || mutation.isPending}
                onClick={() => mutation.mutate(jurisdictionDraftValue(current))}
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
