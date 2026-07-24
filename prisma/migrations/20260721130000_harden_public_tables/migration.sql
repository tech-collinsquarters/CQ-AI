-- These application tables are accessed only by the server through Prisma.
-- Prevent Supabase's public Data API roles from bypassing application-level
-- authorization if default schema grants are changed or inherited.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "case_intakes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "case_files" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE "User" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "cases" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "case_intakes" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "chat_messages" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "daily_usage" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "case_files" FROM anon, authenticated;
