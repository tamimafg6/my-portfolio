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
    const url = `${apiUrl}/experience`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json; charset=utf-8" },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[API experience] Backend error:", res.status, url, text);
      return NextResponse.json(
        { error: "Failed to fetch experience", details: text },
        { status: res.status, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const raw = await res.json();
    const arr = Array.isArray(raw) ? raw : [];
    return NextResponse.json(arr, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API experience] Request failed:", msg);
    return NextResponse.json(
      { error: "Failed to fetch experience", details: msg },
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
    const res = await fetch(`${getApiUrl()}/experience`, {
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
      return NextResponse.json({ error: err.error || "Failed to create experience" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API experience] POST error:", error);
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}
