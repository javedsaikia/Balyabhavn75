"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Ensure only admin can access
      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin credentials required.")
      }

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen px-4 items-center justify-center">
      <div className="w-full max-w-md ring-1 ring-white/10 bg-white/5 rounded-2xl p-8 shadow-xl backdrop-blur-lg space-y-6">
        <div className="space-y-2 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-red-500/15 via-orange-500/10 to-transparent blur-2xl"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 ring-1 ring-white/10 flex bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl shadow-md items-center justify-center overflow-hidden">
                <Shield className="w-8 h-8 text-red-300" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight font-serif">Admin Access</h1>
          <p className="text-sm text-white/70">Secure administrator login</p>
        </div>

        {/* Demo credentials */}
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-300" />
            <p className="text-sm font-medium text-red-200">Demo Admin Credentials</p>
          </div>
        
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Admin Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Admin Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white pr-10"
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Admin Sign In"}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-white/60 hover:text-white/80 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main Login
          </Link>
        </div>
      </div>
    </div>
  )
}
