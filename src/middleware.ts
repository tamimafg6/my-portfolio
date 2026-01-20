import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
