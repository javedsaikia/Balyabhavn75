import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, updateUserStatus, isAdmin } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { status } = await request.json()
    const userId = params.id

    if (!["active", "pending", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be active, pending, or suspended" }, { status: 400 })
    }

    const success = await updateUserStatus(userId, status)

    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
    })
  } catch (error) {
    console.error("Update user status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
