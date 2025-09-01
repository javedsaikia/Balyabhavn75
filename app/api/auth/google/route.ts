import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const supabase = await createClient()
    
    console.log('=== Google OAuth Initiation Debug ===')
    console.log('Origin:', origin)
    console.log('Redirect URL:', `${origin}/auth/callback`)
    
    // Clear any existing session first
    await supabase.auth.signOut()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    console.log('OAuth data received:', !!data)
    console.log('OAuth URL generated:', !!data?.url)
    console.log('=====================================')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data.url) {
      return NextResponse.json({ url: data.url })
    }

    return NextResponse.json({ error: 'No redirect URL received' }, { status: 400 })
  } catch (error) {
    console.error('Google OAuth API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}