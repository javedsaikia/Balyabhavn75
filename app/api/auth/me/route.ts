import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Auth me API called")
    const user = await getCurrentUser()

    if (!user) {
      console.log("[v0] No user found, returning 401")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[v0] User found:", user.email)
    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
