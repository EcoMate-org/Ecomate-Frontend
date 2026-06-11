import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  dashboardPathForRole,
  type SessionRole,
} from "./lib/auth/session";

/** Which role(s) may access each dashboard area. */
const ROLE_DASHBOARDS: Record<string, SessionRole> = {
  "/dashboard/user": "USER",
  "/dashboard/ngo": "NGO",
  "/dashboard/company": "COMPANY",
  "/dashboard/admin": "ADMIN",
};

const AUTH_PAGES = ["/signin", "/signup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Signed-in users shouldn't see the auth pages — send them to their dashboard.
  if (AUTH_PAGES.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(
        new URL(dashboardPathForRole(session.role), req.url),
      );
    }
    return NextResponse.next();
  }

  // Everything below is under /dashboard (see matcher) — require a session.
  if (!session) {
    const signin = new URL("/signin", req.url);
    signin.searchParams.set("next", pathname);
    return NextResponse.redirect(signin);
  }

  // Role-based authorization: only allow the matching role into each area.
  const requiredRole = Object.entries(ROLE_DASHBOARDS).find(([prefix]) =>
    pathname.startsWith(prefix),
  )?.[1];

  if (
    requiredRole &&
    session.role !== requiredRole &&
    session.role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL(dashboardPathForRole(session.role), req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};
