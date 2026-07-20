"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, MessageSquare, Zap } from "lucide-react";
import { toast } from "sonner";

import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryLabel } from "@/constants/case-categories";
import { PLAN_ORDER } from "@/constants/plans";
import { fetchAdminUserDetail, updateAdminUser } from "@/lib/admin-client";
import { formatCaseDate, formatRelativeTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { UpdateUserAccessInput } from "@/validators/admin";
import type { CaseCategory, CaseStatus } from "@prisma/client";

const USER_QUERY_KEY = (userId: string) => ["admin", "user", userId] as const;
const USERS_QUERY_KEY = ["admin", "users"] as const;

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

function formatCount(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function StatTile({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof MessageSquare;
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
    </Card>
  );
}

export function CustomerDetail({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: USER_QUERY_KEY(userId),
    queryFn: () => fetchAdminUserDetail(userId),
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateUserAccessInput) =>
      updateAdminUser(userId, input),
    onSuccess: async () => {
      toast.success("User updated");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY(userId) }),
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (userQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  const user = userQuery.data;
  if (!user) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 md:px-8">
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit gap-2")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to admin
        </Link>
        <p className="text-sm text-destructive">Customer not found.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit gap-2")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to admin
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {user.fullName}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Joined {formatCaseDate(user.createdAt)} ·{" "}
              {user.lastActiveAt
                ? `Active ${formatRelativeTime(user.lastActiveAt)}`
                : "Never active"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              className={selectClassName}
              value={user.plan}
              disabled={updateMutation.isPending}
              aria-label="Plan"
              onChange={(event) =>
                updateMutation.mutate({
                  plan: event.target.value as UpdateUserAccessInput["plan"],
                })
              }
            >
              {PLAN_ORDER.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={user.role}
              disabled={updateMutation.isPending}
              aria-label="Role"
              onChange={(event) =>
                updateMutation.mutate({
                  role: event.target.value as UpdateUserAccessInput["role"],
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
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile title="Cases" value={formatCount(user.cases.length)} icon={FileText} />
        <StatTile
          title="Total messages"
          value={formatCount(user.totals.messages)}
          icon={MessageSquare}
        />
        <StatTile
          title="Total tokens"
          value={formatCount(user.totals.inputTokens + user.totals.outputTokens)}
          icon={Zap}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cases</CardTitle>
          <CardDescription>All matters opened by this client</CardDescription>
        </CardHeader>
        <CardContent>
          {user.cases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cases yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Case</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Messages</th>
                    <th className="py-2 font-medium">Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {user.cases.map((caseRow) => (
                    <tr key={caseRow.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{caseRow.title}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {caseRow.category
                          ? getCategoryLabel(caseRow.category as CaseCategory)
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <CaseStatusBadge status={caseRow.status as CaseStatus} />
                      </td>
                      <td className="py-3 pr-4">{caseRow.messageCount}</td>
                      <td className="py-3 text-muted-foreground">
                        {formatCaseDate(caseRow.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-4" aria-hidden />
            Usage — last 30 days
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.usage.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activity in the last 30 days.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Day</th>
                    <th className="py-2 pr-4 font-medium">Messages</th>
                    <th className="py-2 font-medium">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {[...user.usage].reverse().map((day) => (
                    <tr key={day.day} className="border-b last:border-0">
                      <td className="py-2 pr-4">{day.day}</td>
                      <td className="py-2 pr-4">{day.messageCount}</td>
                      <td className="py-2">
                        {formatCount(day.inputTokens + day.outputTokens)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
