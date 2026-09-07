import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { hasAtLeastRole } from "@/lib/auth/rbac";

/**
 * Edge-level gate for /admin. This is a UX convenience (fast redirect before
 * any admin UI streams down) — every admin server action and API route also
 * re-checks the session itself, so this middleware is never the only guard.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin/staff") && !hasAtLeastRole(session.role, "SUPER_ADMIN")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (
    (pathname.startsWith("/admin/data") || pathname.startsWith("/admin/analytics")) &&
    !hasAtLeastRole(session.role, "ADMIN")
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
