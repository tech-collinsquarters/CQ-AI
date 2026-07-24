-- Speed up admin "usage for today" aggregates across all users.
CREATE INDEX "daily_usage_day_idx" ON "daily_usage"("day");
