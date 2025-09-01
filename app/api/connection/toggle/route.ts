import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json()
    
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid enabled value. Must be boolean.' },
        { status: 400 }
      )
    }

    // Read current .env.local file
    const envPath = join(process.cwd(), '.env.local')
    let envContent = ''
    
    try {
      envContent = await readFile(envPath, 'utf-8')
    } catch (error) {
      // File doesn't exist, create new content
      envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dmiofitmelntaiyrdoac.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Secret - CHANGE THIS IN PRODUCTION!
JWT_SECRET=development-jwt-secret-key-change-in-production-minimum-32-chars

# Environment
NODE_ENV=development

`
    }

    // Update or add SUPABASE_CONNECTION_ENABLED
    const lines = envContent.split('\n')
    let found = false
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('SUPABASE_CONNECTION_ENABLED=')) {
        lines[i] = `SUPABASE_CONNECTION_ENABLED=${enabled}`
        found = true
        break
      }
    }
    
    if (!found) {
      lines.push(`SUPABASE_CONNECTION_ENABLED=${enabled}`)
    }
    
    // Write back to file
    await writeFile(envPath, lines.join('\n'))
    
    // Update process.env for immediate effect
    process.env.SUPABASE_CONNECTION_ENABLED = enabled.toString()
    
    return NextResponse.json({
      success: true,
      enabled,
      message: `Supabase connection ${enabled ? 'enabled' : 'disabled'} successfully`
    })
  } catch (error) {
    console.error('Connection toggle error:', error)
    return NextResponse.json(
      {
        error: 'Failed to toggle connection status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}