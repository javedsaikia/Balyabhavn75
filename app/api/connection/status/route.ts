import { NextResponse } from 'next/server'
import { testSupabaseConnection, isSupabaseConnected } from '@/lib/supabase'

export async function GET() {
  try {
    const enabled = isSupabaseConnected()
    
    if (!enabled) {
      return NextResponse.json({
        connected: false,
        enabled: false,
        message: 'Supabase connection is disabled'
      })
    }

    const connectionTest = await testSupabaseConnection()
    
    return NextResponse.json({
      connected: connectionTest.connected,
      enabled: true,
      error: connectionTest.error,
      message: connectionTest.connected ? 
        'Successfully connected to Supabase' : 
        'Connection test failed'
    })
  } catch (error) {
    console.error('Connection status check error:', error)
    return NextResponse.json(
      {
        connected: false,
        enabled: false,
        error: 'Failed to check connection status'
      },
      { status: 500 }
    )
  }
}