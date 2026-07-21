import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/api/health"];
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isPublicPath(pathname: string) {
  if (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return true;
  }

  return pathname.startsWith("/api/auth/");
}

function isCrossSiteMutation(request: NextRequest): boolean {
  if (
    !request.nextUrl.pathname.startsWith("/api/") ||
    !UNSAFE_METHODS.has(request.method)
  ) {
    return false;
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return true;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin !== request.nextUrl.origin;
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  // Cookie-authenticated mutations must originate from this application.
  // Fetch Metadata covers modern browsers; Origin is the fallback.
  if (isCrossSiteMutation(request)) {
    return NextResponse.json(
      { error: "Cross-site request rejected" },
      { status: 403 },
    );
  }

  if (request.nextUrl.pathname === "/api/health") {
    return NextResponse.next();
  }

  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (
    user &&
    (pathname === "/auth/login" ||
      pathname === "/auth/register" ||
      pathname === "/")
  ) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
