import { NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

/** Stream profile photo from backend so img src works same-origin */
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/profile/photo`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }
    const blob = await res.blob();
    const contentType = res.headers.get("Content-Type") || "image/jpeg";
    return new NextResponse(blob, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("[API profile/photo] GET error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
