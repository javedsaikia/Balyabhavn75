import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "./lib/auth"
import { createServerClient } from '@supabase/ssr'
import { getSupabaseClient, isSupabaseConnected } from './lib/supabase'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/register-user", "/events"]
  const publicRoutePrefixes = ["/register/", "/api/auth", "/api/connection", "/auth/callback"]
  
  // Allow access to public routes
  if (publicRoutes.includes(pathname) || 
      publicRoutePrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if Supabase is connected and enabled
  const supabaseConnected = isSupabaseConnected()
  
  if (supabaseConnected) {
    // Use Supabase authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user || error) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Check if user is trying to access admin routes
    if (pathname.startsWith("/admin") && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return response
  } else {
    // Use JWT authentication (fallback)
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      const payload = await verifyJWT(token)
      
      // Check if user is trying to access admin routes
      if (pathname.startsWith("/admin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      return NextResponse.next()
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico|images).*)"],
}
