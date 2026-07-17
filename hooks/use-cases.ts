"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createCaseRequest,
  fetchCaseById,
  fetchCases,
} from "@/lib/case-client";
import type { CreateCaseInput } from "@/types/case";

export const CASES_QUERY_KEY = ["cases"] as const;

export function caseQueryKey(caseId: string) {
  return ["cases", caseId] as const;
}

export function useCases() {
  return useQuery({
    queryKey: CASES_QUERY_KEY,
    queryFn: fetchCases,
    staleTime: 30_000,
  });
}

export function useCase(caseId: string) {
  return useQuery({
    queryKey: caseQueryKey(caseId),
    queryFn: () => fetchCaseById(caseId),
    enabled: Boolean(caseId),
    staleTime: 30_000,
  });
}

export function useCreateCase() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCaseInput) => createCaseRequest(input),
    onSuccess: async (createdCase) => {
      await queryClient.invalidateQueries({ queryKey: CASES_QUERY_KEY });
      toast.success("Case created successfully");
      router.push(`/cases/${createdCase.id}`);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
