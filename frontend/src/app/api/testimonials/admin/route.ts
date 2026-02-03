import { NextRequest, NextResponse } from "next/server";
import { getAuthServiceBaseUrl } from "@/lib/utils/auth-url";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:8080/api";

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from auth service
    const cookies = request.headers.get("cookie") || "";
    let authToken: string | null = null;

    try {
      // Get token from auth service
      const authServiceUrl = getAuthServiceBaseUrl();
      const tokenUrl = `${authServiceUrl}/api/auth/token`;
      console.log("[Admin Testimonials] Fetching token from:", tokenUrl);
      console.log("[Admin Testimonials] AUTH_SERVICE_URL:", process.env.AUTH_SERVICE_URL);
      console.log("[Admin Testimonials] AUTH_URL:", process.env.AUTH_URL);
      console.log("[Admin Testimonials] NEXT_PUBLIC_AUTH_URL:", process.env.NEXT_PUBLIC_AUTH_URL);
      console.log("[Admin Testimonials] Cookies present:", cookies ? "Yes" : "No");
      console.log("[Admin Testimonials] Cookie value:", cookies.substring(0, 100) + "...");
      
      const tokenRes = await fetch(tokenUrl, {
        method: "GET",
        headers: {
          "Cookie": cookies,
        },
        credentials: "include",
      });

      console.log("[Admin Testimonials] Token response status:", tokenRes.status);
      console.log("[Admin Testimonials] Token response headers:", Object.fromEntries(tokenRes.headers.entries()));

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        authToken = tokenData?.token || null;
        if (authToken) {
          console.log("[Admin Testimonials] Token retrieved successfully, length:", authToken.length);
        } else {
          console.error("[Admin Testimonials] No token in response:", tokenData);
        }
      } else {
        const errorText = await tokenRes.text().catch(() => "Could not read error");
        console.error("[Admin Testimonials] Token request failed:", tokenRes.status, errorText);
        // Return early with 401 if token fetch fails - user is not authenticated
        return NextResponse.json(
          { error: "Authentication failed. Please log in again.", details: `Token endpoint returned ${tokenRes.status}` },
          { 
            status: 401,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          },
        );
      }
    } catch (error: any) {
      console.error("[Admin Testimonials] Error getting auth token:", error?.message || error);
      // Return 401 if we can't even reach the auth service
      return NextResponse.json(
        { error: "Authentication service unavailable", details: error?.message },
        { 
          status: 503,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    // Build headers - we must have a token at this point
    if (!authToken) {
      console.error("[Admin Testimonials] No auth token available after retrieval attempt");
      return NextResponse.json(
        { error: "Authentication failed. No token available." },
        { 
          status: 401,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    const headers: Record<string, string> = {
      "Accept": "application/json; charset=utf-8",
      "Accept-Charset": "utf-8",
      "Authorization": `Bearer ${authToken}`,
    };
    
    console.log("[Admin Testimonials] Using Bearer token for authentication");
    
    console.log("Fetching testimonials from:", `${API_URL}/testimonials/admin`);
    const res = await fetch(`${API_URL}/testimonials/admin`, {
      cache: "no-store",
      headers,
      credentials: "include",
    });

    console.log("Backend response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", res.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch testimonials: ${res.status}`, details: errorText },
        { 
          status: res.status,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    const contentType = res.headers.get("content-type");
    console.log("[Admin Testimonials] Response content-type:", contentType);
    
    const data = await res.json();
    console.log("[Admin Testimonials] Data received:", Array.isArray(data) ? `Array with ${data.length} items` : typeof data);
    
    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("[Admin Testimonials] Error in route handler:", error?.message || error);
    console.error("[Admin Testimonials] Error stack:", error?.stack);
    return NextResponse.json(
      { error: "Failed to fetch testimonials", details: error?.message || String(error) },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
