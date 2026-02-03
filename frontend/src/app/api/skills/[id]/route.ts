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
    const token = await getAdminToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "No token provided. Please log in again." },
        { status: 401 }
      );
    }
    const { id } = await params;
    const body = await request.json();
    const res = await fetch(`${API_URL}/skills/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json; charset=utf-8",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.error || "Failed to update skill" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAdminToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "No token provided. Please log in again." },
        { status: 401 }
      );
    }
    const { id } = await params;
    const res = await fetch(`${API_URL}/skills/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json; charset=utf-8",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.error || "Failed to delete skill" },
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
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
