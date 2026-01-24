import { NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:8080/api";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/skills`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch skills: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 },
    );
  }
}
