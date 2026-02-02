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
