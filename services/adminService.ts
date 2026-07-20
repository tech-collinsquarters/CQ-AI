import type { Plan, Role } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";

export type AdminStats = {
  totalUsers: number;
  totalCases: number;
  totalMessages: number;
  messagesToday: number;
  tokensToday: { input: number; output: number };
  tokensTotal: { input: number; output: number };
};

export type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  plan: Plan;
  createdAt: string;
  lastActiveAt: string | null;
  caseCount: number;
  messagesToday: number;
};

export type AdminUserCase = {
  id: string;
  title: string;
  status: string;
  category: string | null;
  createdAt: string;
  messageCount: number;
};

export type AdminUserUsageDay = {
  day: string;
  messageCount: number;
  inputTokens: number;
  outputTokens: number;
};

export type AdminUserDetail = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  plan: Plan;
  createdAt: string;
  lastActiveAt: string | null;
  cases: AdminUserCase[];
  usage: AdminUserUsageDay[];
  totals: { messages: number; inputTokens: number; outputTokens: number };
};

function utcToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function getAdminStats(): Promise<AdminStats> {
  const prisma = getPrisma();
  const today = utcToday();

  const [totalUsers, totalCases, totalMessages, todayUsage, totalUsage] =
    await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.chatMessage.count(),
      prisma.dailyUsage.aggregate({
        where: { day: today },
        _sum: { messageCount: true, inputTokens: true, outputTokens: true },
      }),
      prisma.dailyUsage.aggregate({
        _sum: { inputTokens: true, outputTokens: true },
      }),
    ]);

  return {
    totalUsers,
    totalCases,
    totalMessages,
    messagesToday: todayUsage._sum.messageCount ?? 0,
    tokensToday: {
      input: todayUsage._sum.inputTokens ?? 0,
      output: todayUsage._sum.outputTokens ?? 0,
    },
    tokensTotal: {
      input: totalUsage._sum.inputTokens ?? 0,
      output: totalUsage._sum.outputTokens ?? 0,
    },
  };
}

export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const prisma = getPrisma();
  const today = utcToday();

  const [users, todayUsage] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { cases: true } } },
    }),
    prisma.dailyUsage.findMany({
      where: { day: today },
      select: { userId: true, messageCount: true },
    }),
  ]);

  const usageByUser = new Map(
    todayUsage.map((u) => [u.userId, u.messageCount]),
  );

  return users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    plan: user.plan,
    createdAt: user.createdAt.toISOString(),
    lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
    caseCount: user._count.cases,
    messagesToday: usageByUser.get(user.id) ?? 0,
  }));
}

const USER_DETAIL_USAGE_DAYS = 30;

export async function getUserDetail(
  userId: string,
): Promise<AdminUserDetail | null> {
  const prisma = getPrisma();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - USER_DETAIL_USAGE_DAYS);
  since.setUTCHours(0, 0, 0, 0);

  const [user, cases, usage, totals] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.case.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        intake: { select: { category: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.dailyUsage.findMany({
      where: { userId, day: { gte: since } },
      orderBy: { day: "asc" },
    }),
    prisma.dailyUsage.aggregate({
      where: { userId },
      _sum: { messageCount: true, inputTokens: true, outputTokens: true },
    }),
  ]);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    plan: user.plan,
    createdAt: user.createdAt.toISOString(),
    lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
    cases: cases.map((caseRecord) => ({
      id: caseRecord.id,
      title: caseRecord.title,
      status: caseRecord.status,
      category: caseRecord.intake?.category ?? null,
      createdAt: caseRecord.createdAt.toISOString(),
      messageCount: caseRecord._count.messages,
    })),
    usage: usage.map((day) => ({
      day: day.day.toISOString().slice(0, 10),
      messageCount: day.messageCount,
      inputTokens: day.inputTokens,
      outputTokens: day.outputTokens,
    })),
    totals: {
      messages: totals._sum.messageCount ?? 0,
      inputTokens: totals._sum.inputTokens ?? 0,
      outputTokens: totals._sum.outputTokens ?? 0,
    },
  };
}

export async function updateUserAccess(
  userId: string,
  data: { role?: Role; plan?: Plan },
): Promise<void> {
  await getPrisma().user.update({
    where: { id: userId },
    data,
  });
}
