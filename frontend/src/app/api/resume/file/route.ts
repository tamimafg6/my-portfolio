import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

/** Stream the resume PDF from backend (locale=en|fr for English or French CV). */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") === "fr" ? "fr" : "en";
    const res = await fetch(`${API_URL}/resume/file?locale=${locale}`, {
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }
    const blob = await res.blob();
    const filename = locale === "fr" ? "cv.pdf" : "resume.pdf";
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[API resume/file] GET error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
