import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConnected } from '@/lib/supabase'

// Test endpoint to verify unique ID generation
export async function GET() {
  try {
    // Check if Supabase is connected
    if (!isSupabaseConnected()) {
      return NextResponse.json(
        { error: 'Supabase connection not available' },
        { status: 503 }
      )
    }

    // Test if the unique ID generation function exists
    const { data: uniqueId, error } = await supabaseAdmin.rpc('generate_unique_user_id')
    
    if (error) {
      return NextResponse.json(
        { 
          error: 'Unique ID generation failed', 
          details: error.message,
          suggestion: 'The database schema may not have been applied yet. Please run the SQL commands in supabase-schema.sql in your Supabase dashboard.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      uniqueId: uniqueId,
      message: 'Unique ID generation is working correctly'
    })

  } catch (error) {
    console.error('Unique ID test error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please ensure the database schema has been applied to Supabase'
      },
      { status: 500 }
    )
  }
}