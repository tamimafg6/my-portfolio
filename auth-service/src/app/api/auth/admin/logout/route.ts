import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";

/**
 * Admin Logout
 * POST /api/auth/admin/logout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Delete all sessions for this user
    await db.delete(schema.session).where(eq(schema.session.userId, userId));

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 },
    );
  }
}
