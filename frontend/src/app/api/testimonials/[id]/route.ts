import { NextRequest, NextResponse } from "next/server";
import { getAuthServiceBaseUrl } from "@/lib/utils/auth-url";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:8080/api";

async function getAuthToken(cookies: string): Promise<string | null> {
  try {
    const authServiceUrl = getAuthServiceBaseUrl();
    const tokenRes = await fetch(`${authServiceUrl}/api/auth/token`, {
      method: "GET",
      headers: {
        "Cookie": cookies,
      },
      credentials: "include",
    });

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      return tokenData?.token || null;
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }
  return null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookies = request.headers.get("cookie") || "";
    const authToken = await getAuthToken(cookies);

    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=utf-8",
      "Accept": "application/json; charset=utf-8",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    } else {
      headers["Cookie"] = cookies;
    }

    const res = await fetch(`${API_URL}/testimonials/${id}`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.error || "Failed to update testimonial" },
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
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookies = request.headers.get("cookie") || "";
    const authToken = await getAuthToken(cookies);

    const headers: Record<string, string> = {
      "Accept": "application/json; charset=utf-8",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    } else {
      headers["Cookie"] = cookies;
    }

    const res = await fetch(`${API_URL}/testimonials/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.error || "Failed to delete testimonial" },
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
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
