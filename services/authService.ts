import { AuthProvider, Role, type User } from "@prisma/client";
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

export async function register(
  fullName: string,
  email: string,
  password: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const authUser = data.user;
  if (!authUser) {
    throw new Error("Sign up succeeded but no user was returned");
  }

  const user = await getPrisma().user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      fullName,
      email,
      role: Role.USER,
      authProvider: AuthProvider.EMAIL,
    },
    update: {
      fullName,
      email,
      authProvider: AuthProvider.EMAIL,
    },
  });

  return { authUser, user: toAppUser(user) };
}

export async function login(email: string, password: string) {
  const supabase = await createClient();

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

  const user = await getPrisma().user.findUnique({
    where: { id: data.user.id },
  });

  return {
    user: user ? toAppUser(user) : null,
    session: data.session,
    authUser: data.user,
  };
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const user = await getPrisma().user.findUnique({
    where: { id: authUser.id },
  });

  return user ? toAppUser(user) : null;
}
