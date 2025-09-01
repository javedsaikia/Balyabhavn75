import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, setAuthCookie } from "@/lib/auth"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login API called")
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    try {
      const user = await authenticateUser(email, password)

      if (!user) {
        console.log("[v0] Authentication failed for:", email)
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      console.log("[v0] User authenticated:", user.email)
      await setAuthCookie(user)

      const { ...userData } = user

      return NextResponse.json({
        success: true,
        user: userData,
        redirectUrl: user.role === "admin" ? "/admin" : "/events",
      })
    } catch (authError) {
      console.error("[v0] Authentication error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
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
