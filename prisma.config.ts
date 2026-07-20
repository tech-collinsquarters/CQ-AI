import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js keeps secrets in .env.local; Prisma CLI does not load it by default.
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7 CLI (migrate/db push) uses this URL — prefer direct/session, not transaction pooler.
    url: env("DIRECT_URL"),
  },
});
