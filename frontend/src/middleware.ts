import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("better-auth.session_token");

    // If no session token, redirect to login
    if (!sessionToken && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // If has session token and trying to access login, redirect to dashboard
    if (sessionToken && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Handle internationalization for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|fr)/:path*", "/admin/:path*"],
};
