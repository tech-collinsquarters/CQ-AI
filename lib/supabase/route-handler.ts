import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type PendingCookie = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/**
 * Builds a Supabase client for auth Route Handlers.
 * Session cookies are collected so they can be attached to the final NextResponse
 * (Next.js 15+ may not propagate cookies().set() onto a later JSON response).
 */
export async function createAuthRouteClient() {
  const cookieStore = await cookies();
  const pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Ignore read-only cookie store edge cases.
            }
            pendingCookies.push({ name, value, options });
          });
        },
      },
    },
  );

  return { supabase, pendingCookies };
}

export function applyCookies(
  response: NextResponse,
  pendingCookies: PendingCookie[],
) {
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options as Parameters<NextResponse["cookies"]["set"]>[2]);
  }
  return response;
}

export function jsonWithAuthCookies(
  body: unknown,
  pendingCookies: PendingCookie[],
  init?: { status?: number },
) {
  const response = NextResponse.json(body, { status: init?.status ?? 200 });
  return applyCookies(response, pendingCookies);
}
