import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/api/get-admin-token";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

/** Upload resume PDF (admin only). Forwards file to backend. */
export async function POST(request: NextRequest) {
  try {
    const token = await getAdminToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const locale = formData.get("locale") === "fr" ? "fr" : "en";
    if (!file || typeof (file as Blob & { type?: string }).type !== "string") {
      return NextResponse.json(
        { error: "No file uploaded. Please select a PDF file." },
        { status: 400 }
      );
    }
    if ((file as Blob & { type: string }).type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }
    const body = new FormData();
    body.append("file", file);
    body.append("locale", locale);
    const res = await fetch(`${API_URL}/resume/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data.detail
        ? `${data.error}: ${data.detail}`
        : data.error || "Failed to upload resume";
      console.error("[API resume/upload] Backend responded:", res.status, data);
      return NextResponse.json(
        { error: message },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    const err = error as Error & { cause?: { code?: string } };
    console.error("[API resume/upload] POST error:", err?.message, err?.cause);
    const isConnectionError =
      err?.cause?.code === "ECONNREFUSED" ||
      err?.message?.toLowerCase().includes("fetch") ||
      err?.message?.toLowerCase().includes("econnrefused") ||
      err?.message?.toLowerCase().includes("network");
    const message = isConnectionError
      ? "Cannot reach the backend. Start it with: cd backend && npm run dev (and ensure it listens on port 8080)."
      : `Failed to upload resume${err?.message ? `: ${err.message}` : ""}`;
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
