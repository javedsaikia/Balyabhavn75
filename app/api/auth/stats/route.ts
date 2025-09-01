import { type NextRequest, NextResponse } from "next/server"
import { getRegistrationStats, getCurrentUser, isAdmin } from "@/lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const stats = await getRegistrationStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
