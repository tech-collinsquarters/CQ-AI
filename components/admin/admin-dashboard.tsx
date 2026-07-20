"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Download, FileText, MessageSquare, Users, Zap } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PLAN_ORDER } from "@/constants/plans";
import {
  fetchAdminStats,
  fetchAdminUsers,
  updateAdminUser,
} from "@/lib/admin-client";
import { formatCaseDate, formatRelativeTime } from "@/lib/format-date";
import type { UpdateUserAccessInput } from "@/validators/admin";

const STATS_QUERY_KEY = ["admin", "stats"] as const;
const USERS_QUERY_KEY = ["admin", "users"] as const;

function formatCount(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail?: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" aria-hidden />
          {title}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {detail ? (
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {detail}
        </CardContent>
      ) : null}
    </Card>
  );
}

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function AdminDashboard() {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: fetchAdminStats,
  });

  const usersQuery = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: fetchAdminUsers,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      userId,
      input,
    }: {
      userId: string;
      input: UpdateUserAccessInput;
    }) => updateAdminUser(userId, input),
    onSuccess: async () => {
      toast.success("User updated");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  const stats = statsQuery.data;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Admin console
          </h1>
          <p className="text-sm text-muted-foreground">
            Firm-wide usage, clients, and plan management
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          nativeButton={false}
          render={<a href="/api/admin/users/export" download />}
        >
          <Download className="size-3.5" aria-hidden />
          Export CSV
        </Button>
      </header>

      {statsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Clients" value={formatCount(stats.totalUsers)} icon={Users} />
          <StatCard title="Cases" value={formatCount(stats.totalCases)} icon={FileText} />
          <StatCard
            title="Messages"
            value={formatCount(stats.totalMessages)}
            detail={`${formatCount(stats.messagesToday)} sent today`}
            icon={MessageSquare}
          />
          <StatCard
            title="Tokens today"
            value={formatCount(stats.tokensToday.input + stats.tokensToday.output)}
            detail={`All time: ${formatCount(stats.tokensTotal.input + stats.tokensTotal.output)}`}
            icon={Zap}
          />
        </div>
      ) : (
        <p className="text-sm text-destructive">Unable to load stats.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Change roles and plans. Plan limits apply from the next message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : usersQuery.data ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">User</th>
                    <th className="py-2 pr-4 font-medium">Joined</th>
                    <th className="py-2 pr-4 font-medium">Last active</th>
                    <th className="py-2 pr-4 font-medium">Cases</th>
                    <th className="py-2 pr-4 font-medium">Msgs today</th>
                    <th className="py-2 pr-4 font-medium">Plan</th>
                    <th className="py-2 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.data.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-medium hover:underline"
                        >
                          {user.fullName}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {formatCaseDate(user.createdAt)}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {user.lastActiveAt
                          ? formatRelativeTime(user.lastActiveAt)
                          : "Never"}
                      </td>
                      <td className="py-3 pr-4">{user.caseCount}</td>
                      <td className="py-3 pr-4">{user.messagesToday}</td>
                      <td className="py-3 pr-4">
                        <select
                          className={selectClassName}
                          value={user.plan}
                          disabled={updateMutation.isPending}
                          aria-label={`Plan for ${user.email}`}
                          onChange={(event) =>
                            updateMutation.mutate({
                              userId: user.id,
                              input: {
                                plan: event.target
                                  .value as UpdateUserAccessInput["plan"],
                              },
                            })
                          }
                        >
                          {PLAN_ORDER.map((plan) => (
                            <option key={plan} value={plan}>
                              {plan}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <select
                            className={selectClassName}
                            value={user.role}
                            disabled={updateMutation.isPending}
                            aria-label={`Role for ${user.email}`}
                            onChange={(event) =>
                              updateMutation.mutate({
                                userId: user.id,
                                input: {
                                  role: event.target
                                    .value as UpdateUserAccessInput["role"],
                                },
                              })
                            }
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          {user.role === "ADMIN" ? (
                            <Badge variant="secondary">admin</Badge>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-destructive">Unable to load users.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
