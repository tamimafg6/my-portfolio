import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/api/get-admin-token";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

/** Upload profile photo (admin only). Forwards file to backend. */
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
    if (!file || typeof (file as Blob & { type?: string }).type !== "string") {
      return NextResponse.json(
        { error: "No file uploaded. Please select an image (JPEG, PNG, or WebP)." },
        { status: 400 }
      );
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes((file as Blob & { type: string }).type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, or WebP images are allowed." },
        { status: 400 }
      );
    }
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`${API_URL}/profile/photo/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data.detail
        ? `${data.error}: ${data.detail}`
        : data.error || "Failed to upload profile photo";
      return NextResponse.json(
        { error: message },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API profile/photo/upload] POST error:", error);
    const message =
      error instanceof TypeError && (error as TypeError).message?.includes("fetch")
        ? "Cannot reach the backend. Make sure the backend is running (e.g. npm run dev in the backend folder, or use Docker)."
        : "Failed to upload profile photo";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
