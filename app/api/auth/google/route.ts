import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const supabase = await createClient()
    
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