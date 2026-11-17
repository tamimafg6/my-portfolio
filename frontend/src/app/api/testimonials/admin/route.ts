import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/api/get-admin-token";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:8080/api";

export async function GET(request: NextRequest) {
  try {
    const authToken = await getAdminToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication failed. Please log in again." },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    const res = await fetch(`${API_URL}/testimonials/admin`, {
      cache: "no-store",
      headers: {
        Accept: "application/json; charset=utf-8",
        "Accept-Charset": "utf-8",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", res.status, errorText);
      return NextResponse.json(
        {
          error: `Failed to fetch testimonials: ${res.status}`,
          details: errorText,
        },
        {
          status: res.status,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error(
      "[Admin Testimonials] Error in route handler:",
      error?.message || error,
    );
    return NextResponse.json(
      {
        error: "Failed to fetch testimonials",
        details: error?.message || String(error),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
