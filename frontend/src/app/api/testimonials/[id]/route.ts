import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/api/get-admin-token";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:8080/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const authToken = await getAdminToken(request);

    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=utf-8",
      "Accept": "application/json; charset=utf-8",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
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
    const authToken = await getAdminToken(request);

    const headers: Record<string, string> = {
      "Accept": "application/json; charset=utf-8",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
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
