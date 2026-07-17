"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading && !user) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        <Spinner />
        Loading profile…
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            You are signed in. Case management and AI chat come next.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void logout();
          }}
          disabled={loading}
        >
          {loading ? <Spinner /> : null}
          Log out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User profile</CardTitle>
          <CardDescription>
            Application profile synced from Supabase Auth.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Full name</p>
            <p className="font-medium">{user?.fullName ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Role</p>
            <p className="font-medium">{user?.role ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">User ID</p>
            <p className="font-mono text-xs">{user?.id ?? "—"}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
