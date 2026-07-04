import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

const authRoutes = new Set(["/auth/sign-in", "/auth/sign-up"]);

const protectedPrefixes = ["/account", "/checkout", "/order"];
const adminPrefixes = ["/admin", "/ops"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = sessionToken ? await verifySessionToken(sessionToken) : null;

  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) && !sessionUser) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (adminPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (!sessionUser) {
      const redirectUrl = new URL("/auth/sign-in", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!["admin", "ops"].includes(sessionUser.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (authRoutes.has(pathname) && sessionUser) {
    const destination = sessionUser.role === "admin" || sessionUser.role === "ops" ? "/admin" : "/account";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const response = NextResponse.next();
  const city = request.headers.get("x-vercel-ip-city") ?? "Gurugram";

  response.headers.set("x-freshcart-region", city);
  response.headers.set("x-freshcart-platform", pathname.startsWith("/admin") ? "admin" : "shopper");

  return response;
}

export const config = {
  matcher: [
    "/catalog/:path*",
    "/admin/:path*",
    "/ops/:path*",
    "/checkout",
    "/order/:path*",
    "/account/:path*",
    "/auth/sign-in",
    "/auth/sign-up",
  ],
};
