"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "@/lib/auth-client";
import type { AppUser } from "@/types/auth";
import type { LoginInput, RegisterInput } from "@/validators/auth";

const CURRENT_USER_QUERY_KEY = ["auth", "me"] as const;

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const currentUserQuery = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
    retry: false,
  });

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async () => {
      await refreshUser();
      toast.success("Logged in successfully");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: async (result) => {
      if (result.requiresLogin || !result.session) {
        toast.success(
          result.message ??
            "Account created. Please sign in to continue.",
        );
        router.push("/auth/login");
        router.refresh();
        return;
      }

      await refreshUser();
      toast.success("Registered successfully");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: async () => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: currentUserQuery.data ?? null,
      loading:
        currentUserQuery.isLoading ||
        loginMutation.isPending ||
        registerMutation.isPending ||
        logoutMutation.isPending,
      login: async (input) => {
        await loginMutation.mutateAsync(input);
      },
      register: async (input) => {
        await registerMutation.mutateAsync(input);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
      refreshUser,
    }),
    [
      currentUserQuery.data,
      currentUserQuery.isLoading,
      loginMutation,
      registerMutation,
      logoutMutation,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
