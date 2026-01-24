import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // First, let intl middleware handle locale routing
  const response = intlMiddleware(request);
  
  // Check if accessing admin routes (after locale prefix)
  const isAdminRoute = /^\/(en|fr)\/admin/.test(pathname);
  
  if (isAdminRoute) {
    const sessionToken = request.cookies.get("better-auth.session_token");
    const localeMatch = pathname.match(/^\/(en|fr)/);
    const locale = localeMatch ? localeMatch[1] : "en";
    
    // If no session token, redirect to login
    if (!sessionToken && !pathname.includes("/login")) {
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }

    // If has session token and trying to access login, redirect to dashboard
    if (sessionToken && pathname.includes("/login")) {
      return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
    }
  }
  
  // Also handle /admin/* routes (without locale) - redirect to /en/admin/*
  if (pathname.startsWith("/admin") && !pathname.startsWith("/(en|fr)/admin")) {
    const newPath = pathname.replace("/admin", "/en/admin");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/(en|fr)/:path*", "/admin/:path*"],
};
