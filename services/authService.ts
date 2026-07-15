import { AuthProvider, PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@/lib/supabase/server";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrisma() {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export async function register(name: string, email: string, password: string) {
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
      name,
      email,
      role: Role.USER,
      authProvider: AuthProvider.EMAIL,
    },
    update: {
      name,
      email,
      authProvider: AuthProvider.EMAIL,
    },
  });

  return { authUser, user };
}
