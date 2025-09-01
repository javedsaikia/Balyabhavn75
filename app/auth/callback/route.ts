import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const next = searchParams.get('next') ?? '/'

    // Also check for hash parameters (for implicit flow)
    const hash = request.url.split('#')[1]
    let accessToken = null
    if (hash) {
      const hashParams = new URLSearchParams(hash)
      accessToken = hashParams.get('access_token')
      console.log('Hash parameters found:', Object.fromEntries(hashParams))
    }

    console.log('=== OAuth Callback Debug ===')
    console.log('Full URL:', request.url)
    console.log('Origin:', origin)
    console.log('Code present:', !!code)
    console.log('Access token present:', !!accessToken)
    console.log('Error:', error)
    console.log('Error Description:', errorDescription)
    console.log('All search params:', Object.fromEntries(searchParams))
    console.log('==========================')

    // If there's an OAuth error from the provider
    if (error) {
      console.error('OAuth provider error:', error, errorDescription)
      return NextResponse.redirect(`${origin}/?error=oauth_provider_error&details=${encodeURIComponent(errorDescription || error)}`)
    }

    if (!code && !accessToken) {
      console.error('OAuth callback failed - no code or access token provided')
      return NextResponse.redirect(`${origin}/?error=no_auth_code`)
    }

    const supabase = await createClient()
    
    if (code) {
      // PKCE flow - exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/?error=code_exchange_failed&details=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session && data.user) {
        // Check if user profile exists in our users table
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!existingUser) {
          // Generate unique ID for the new user
          const { data: uniqueIdData, error: uniqueIdError } = await supabaseAdmin
            .rpc('generate_unique_user_id')
          
          if (uniqueIdError) {
            console.error('Error generating unique ID:', uniqueIdError)
            return NextResponse.redirect(`${origin}/?error=unique_id_generation_failed&details=${encodeURIComponent(uniqueIdError.message)}`)
          }

          // Create user profile from OAuth data
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              id: data.user.id,
              unique_id: uniqueIdData,
              email: data.user.email!,
              name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
              role: 'user',
              status: 'active',
              registration_date: new Date().toISOString().split('T')[0],
            })

          if (insertError) {
            console.error('Error creating user profile:', insertError)
            return NextResponse.redirect(`${origin}/?error=profile_creation_failed&details=${encodeURIComponent(insertError.message)}`)
          }
        }

        console.log('OAuth success - session created for user:', data.user?.email)
        console.log('Redirecting to:', `${origin}/events`)
        const redirectResponse = NextResponse.redirect(`${origin}/events`)
        console.log('Redirect response created successfully')
        return redirectResponse
      }
    }

    console.error('No session created after OAuth callback')
    return NextResponse.redirect(`${origin}/?error=no_session_created`)
  } catch (error) {
    console.error('OAuth callback route error:', error)
    const origin = new URL(request.url).origin
    return NextResponse.redirect(`${origin}/?error=callback_exception&details=${encodeURIComponent(String(error))}`)
  }
}