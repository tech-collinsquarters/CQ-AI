import { AuthProvider, Role, type User } from "@prisma/client";
import type { SupabaseClient, User as AuthUser } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { getPrisma } from "@/lib/prisma";

export type AppUser = Pick<
  User,
  "id" | "fullName" | "email" | "role" | "authProvider" | "createdAt" | "updatedAt"
>;

function toAppUser(user: User): AppUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Ensure a Prisma User exists for a Supabase auth user.
 * Fixes the split-brain where middleware sees Auth but /api/auth/me returns 401.
 */
export async function syncPrismaUser(
  authUser: AuthUser,
  overrides?: { fullName?: string; authProvider?: AuthProvider },
): Promise<AppUser> {
  const email = authUser.email;
  if (!email) {
    throw new Error("Auth user is missing an email address");
  }

  const fullName =
    overrides?.fullName?.trim() ||
    (typeof authUser.user_metadata?.full_name === "string"
      ? authUser.user_metadata.full_name
      : null) ||
    (typeof authUser.user_metadata?.fullName === "string"
      ? authUser.user_metadata.fullName
      : null) ||
    email.split("@")[0] ||
    "User";

  const authProvider = overrides?.authProvider ?? AuthProvider.EMAIL;

  const user = await getPrisma().user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      fullName,
      email,
      role: Role.USER,
      authProvider,
    },
    update: {
      email,
      ...(overrides?.fullName ? { fullName: overrides.fullName } : {}),
      ...(overrides?.authProvider ? { authProvider: overrides.authProvider } : {}),
    },
  });

  return toAppUser(user);
}

export async function registerWithClient(
  supabase: SupabaseClient,
  fullName: string,
  email: string,
  password: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, fullName },
    },
  });

  if (error) {
    throw error;
  }

  const authUser = data.user;
  if (!authUser) {
    throw new Error("Sign up succeeded but no user was returned");
  }

  const user = await syncPrismaUser(authUser, {
    fullName,
    authProvider: AuthProvider.EMAIL,
  });

  return {
    authUser,
    user,
    session: data.session,
  };
}

export async function loginWithClient(
  supabase: SupabaseClient,
  email: string,
  password: string,
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user || !data.session) {
    throw new Error("Login succeeded but no session was returned");
  }

  const user = await syncPrismaUser(data.user, {
    authProvider: AuthProvider.EMAIL,
  });

  return {
    user,
    session: data.session,
    authUser: data.user,
  };
}

export async function logoutWithClient(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/** @deprecated Prefer loginWithClient with a response-bound client */
export async function register(
  fullName: string,
  email: string,
  password: string,
) {
  const supabase = await createClient();
  return registerWithClient(supabase, fullName, email, password);
}

/** @deprecated Prefer loginWithClient with a response-bound client */
export async function login(email: string, password: string) {
  const supabase = await createClient();
  return loginWithClient(supabase, email, password);
}

export async function logout() {
  const supabase = await createClient();
  await logoutWithClient(supabase);
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // Safety net: sync Prisma if Auth exists but app user row is missing
  try {
    return await syncPrismaUser(authUser);
  } catch (error) {
    console.error("getCurrentUser sync failed:", error);
    const user = await getPrisma().user.findUnique({
      where: { id: authUser.id },
    });
    return user ? toAppUser(user) : null;
  }
}
