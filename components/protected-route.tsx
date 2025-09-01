"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type User, type Admin, isAdmin, isUser } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireUser?: boolean
  fallbackUrl?: string
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireUser = false,
  fallbackUrl = "/",
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current user from server
        const response = await fetch("/api/auth/me")

        if (!response.ok) {
          // Not authenticated
          router.push(fallbackUrl)
          return
        }

        const data = await response.json()
        const currentUser = data.user

        setUser(currentUser)

        // Check access permissions
        if (requireAdmin && !isAdmin(currentUser)) {
          router.push("/events?error=admin_access_required")
          return
        }

        if (requireUser && !isUser(currentUser) && !isAdmin(currentUser)) {
          router.push(fallbackUrl + "?error=authentication_required")
          return
        }

        setHasAccess(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push(fallbackUrl)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [requireAdmin, requireUser, fallbackUrl, router])

  if (isLoading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verifying access...</span>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}
