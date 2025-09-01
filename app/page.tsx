"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, Lock, Eye, EyeOff, Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient, isSupabaseConnected } from "@/lib/supabase"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginType, setLoginType] = useState<"user" | "admin">("user")
  const router = useRouter()

  // Handle OAuth errors from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const details = urlParams.get('details')
    const message = urlParams.get('message')
    
    if (error) {
      let errorMessage = 'Authentication failed'
      
      switch (error) {
        case 'pkce_verification_failed':
          errorMessage = message || 'OAuth verification failed. Please try logging in again.'
          break
        case 'code_exchange_failed':
          errorMessage = 'OAuth authentication failed. Please try again or contact support if the issue persists.'
          break
        case 'oauth_provider_error':
          errorMessage = `OAuth provider error: ${details || 'Unknown error'}`
          break
        case 'no_auth_code':
          errorMessage = 'OAuth authentication was cancelled or failed to complete.'
          break
        case 'no_session_created':
          errorMessage = 'Failed to create authentication session. Please try again.'
          break
        default:
          errorMessage = details ? decodeURIComponent(details) : 'Authentication failed'
      }
      
      setError(errorMessage)
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [])

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

      // User login successful - redirect to user dashboard
      router.push(data.redirectUrl)
    } catch (error) {
      let errorMessage = "Login failed"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== Client-side Google Sign-in Debug ===')
      setIsLoading(true)
      setError("")
      
      // Check if Supabase is properly configured
      const supabaseConnected = isSupabaseConnected()
      console.log('Supabase connected:', supabaseConnected)
      
      if (!supabaseConnected) {
        console.log('Supabase not connected, showing error')
        setError('Google authentication is not available. Please configure Supabase or use email login.')
        return
      }
      
      console.log('Making request to /api/auth/google')
      // Call the API route for Google OAuth
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Google OAuth')
      }
      
      if (data.url) {
        window.location.href = data.url
      }
      
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="relative z-10 flex min-h-screen px-4 items-center justify-center">
      <div className="w-full max-w-sm ring-1 ring-white/10 bg-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-lg space-y-4">
        <div className="space-y-2 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-transparent blur-2xl"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 ring-1 ring-white/10 flex bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-xl shadow-md items-center justify-center overflow-hidden">
                <Image
                  src="/images/balya-logo.png"
                  alt="Balya Bhavan Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight font-serif">Balya Bhavan Alumni Jorhat</h1>
          <p className="text-sm text-white/70">Sign in to continue</p>
        </div>



        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg py-2.5 text-sm font-medium transition flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>


        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/5 text-white/60">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white pr-10"
                placeholder="Enter your password"
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
            className="w-full mt-6 bg-white text-black hover:bg-white/90 active:bg-white/80 rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : `Sign In as ${loginType === "admin" ? "Admin" : "Alumni"}`}
          </Button>
        </form>

        <div className="space-y-3 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/5 text-white/60">New to Alumni Network?</span>
            </div>
          </div>

          <Link href="/register-user">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Alumni Account
            </Button>
          </Link>


        </div>
      </div>
    </div>
  )
}
