"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details from authentication.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User profile</CardTitle>
          <CardDescription>
            Synced from Supabase Auth and the Prisma User record.
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
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">{user?.role ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">User ID</p>
                <p className="font-mono text-xs break-all">{user?.id ?? "—"}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
