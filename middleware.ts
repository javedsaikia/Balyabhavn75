import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "./lib/auth"
import { createServerClient } from '@supabase/ssr'
import { getSupabaseClient, isSupabaseConnected } from './lib/supabase'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/register-user", "/events"]
  const publicRoutePrefixes = ["/register/", "/api/auth", "/api/connection", "/auth/callback", "/_next", "/favicon.ico", "/images"]
  
  // Allow access to public routes and static assets
  if (publicRoutes.includes(pathname) || 
      publicRoutePrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
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
        console.log('Supabase auth failed, redirecting to login')
        return NextResponse.redirect(new URL("/?error=authentication_required", request.url))
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return NextResponse.redirect(new URL("/?error=profile_error", request.url))
      }

      // Check if user is trying to access admin routes
      if (pathname.startsWith("/admin") && profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/events?error=admin_access_required", request.url))
      }

      return response
    } else {
      // Use JWT authentication (fallback)
      const token = request.cookies.get("token")?.value

      if (!token) {
        console.log('No JWT token found, redirecting to login')
        return NextResponse.redirect(new URL("/?error=authentication_required", request.url))
      }

      try {
        const payload = await verifyJWT(token)
        
        // Check if user is trying to access admin routes
        if (pathname.startsWith("/admin") && payload.role !== "admin") {
          return NextResponse.redirect(new URL("/events?error=admin_access_required", request.url))
        }

        return NextResponse.next()
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError)
        // Invalid token, redirect to login
        return NextResponse.redirect(new URL("/?error=invalid_token", request.url))
      }
    }
  } catch (middlewareError) {
    console.error('Middleware error:', middlewareError)
    // Fallback to login on any middleware error
    return NextResponse.redirect(new URL("/?error=middleware_error", request.url))
  }
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico|images).*)"],
}
