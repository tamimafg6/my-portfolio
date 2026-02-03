import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/api/get-admin-token";

function getApiUrl(): string {
  const url =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api";
  return url.replace(/\/$/, "");
}

export async function GET() {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/education`, {
      cache: "no-store",
      headers: {
        Accept: "application/json; charset=utf-8",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[API education] Backend error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to fetch education", details: text },
        { status: res.status, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return NextResponse.json(list, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education", details: String(error) },
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAdminToken(request);
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const body = await request.json();
    const res = await fetch(`${getApiUrl()}/education`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.error || "Failed to create education" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API education] POST error:", error);
    return NextResponse.json({ error: "Failed to create education" }, { status: 500 });
  }
}
