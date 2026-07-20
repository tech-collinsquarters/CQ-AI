"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPlanUsage } from "@/lib/plan-client";

export const PLAN_USAGE_QUERY_KEY = ["me", "plan"] as const;

export function usePlanUsage() {
  return useQuery({
    queryKey: PLAN_USAGE_QUERY_KEY,
    queryFn: fetchPlanUsage,
    staleTime: 30_000,
  });
}
