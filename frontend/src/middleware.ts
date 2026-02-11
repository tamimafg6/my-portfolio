import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /admin/* routes (without locale) FIRST - redirect to /en/admin/*
  // This must happen before intl middleware to avoid duplication
  if (pathname.startsWith("/admin") && !/^\/(en|fr)\/admin/.test(pathname)) {
    const newPath = pathname.replace("/admin", "/en/admin");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Let intl middleware handle locale routing first
  const response = intlMiddleware(request);
  
  // After intl middleware processes, check admin routes
  // Use the original pathname since intl middleware handles locale internally
  const isAdminRoute = /^\/(en|fr)\/admin/.test(pathname);
  
  if (isAdminRoute) {
    // Better Auth uses __Secure- prefix for cookies over HTTPS (production)
    const sessionToken =
      request.cookies.get("better-auth.session_token") ??
      request.cookies.get("__Secure-better-auth.session_token");
    const localeMatch = pathname.match(/^\/(en|fr)/);
    const locale = localeMatch ? localeMatch[1] : "en";

    // Always allow access to login page (user might be logging out or re-logging in)
    if (pathname.includes("/login")) {
      return response;
    }

    // If no session token, redirect to login
    if (!sessionToken) {
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/(en|fr)/:path*", "/admin/:path*"],
};
