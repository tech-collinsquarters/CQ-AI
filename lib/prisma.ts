import "server-only";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPoolSize(): number {
  const configured = Number.parseInt(process.env.DATABASE_POOL_MAX ?? "", 10);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(configured, 20);
  }
  // Serverless instances scale horizontally, so each instance should keep a
  // deliberately small pool behind Supabase's transaction-mode pooler.
  return process.env.NODE_ENV === "production" ? 3 : 5;
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }

    const pool = new Pool({
      connectionString,
      max: getPoolSize(),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    const adapter = new PrismaPg(pool, {
      onPoolError: (error) => console.error("PostgreSQL pool error:", error),
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
