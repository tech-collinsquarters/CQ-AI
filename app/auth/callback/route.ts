import { AuthProvider } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  createAuthRouteClient,
  redirectWithAuthCookies,
} from "@/lib/supabase/route-handler";
import { syncPrismaUser } from "@/services/authService";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/dashboard";
  }

  return next;
}

function loginErrorUrl(origin: string, message: string) {
  const url = new URL("/auth/login", origin);
  url.searchParams.set("error", message);
  return url;
}

function redirectOrigin(request: Request, origin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    return `https://${forwardedHost}`;
  }

  return origin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const oauthError = searchParams.get("error");
  const oauthDescription = searchParams.get("error_description");

  if (oauthError) {
    const message =
      oauthError === "access_denied"
        ? "Google sign-in was cancelled."
        : oauthDescription?.replace(/\+/g, " ") || "Unable to sign in with Google.";
    return NextResponse.redirect(loginErrorUrl(origin, message));
  }

  if (!code) {
    return NextResponse.redirect(
      loginErrorUrl(origin, "Google sign-in did not return a valid code."),
    );
  }

  const { supabase, pendingCookies } = await createAuthRouteClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("GET /auth/callback:", error?.message);
    return redirectWithAuthCookies(
      loginErrorUrl(origin, "Unable to complete Google sign-in."),
      pendingCookies,
    );
  }

  try {
    await syncPrismaUser(data.user, { authProvider: AuthProvider.GOOGLE });
  } catch (syncError) {
    console.error("GET /auth/callback sync failed:", syncError);
    await supabase.auth.signOut();
    const isDuplicateEmail =
      typeof syncError === "object" &&
      syncError !== null &&
      "code" in syncError &&
      syncError.code === "P2002";
    return redirectWithAuthCookies(
      loginErrorUrl(
        origin,
        isDuplicateEmail
          ? "This email is already registered. Sign in with your existing account."
          : "Unable to complete Google sign-in.",
      ),
      pendingCookies,
    );
  }

  return redirectWithAuthCookies(
    `${redirectOrigin(request, origin)}${next}`,
    pendingCookies,
  );
}
