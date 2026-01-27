import { NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:8080/api";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/education`, {
      cache: "no-store",
      headers: {
        "Accept": "application/json; charset=utf-8",
        "Accept-Charset": "utf-8",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch education: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
