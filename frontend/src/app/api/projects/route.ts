import { NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:8080/api";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/projects`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
