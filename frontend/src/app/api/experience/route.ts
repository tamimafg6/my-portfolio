import { NextResponse } from "next/server";

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
