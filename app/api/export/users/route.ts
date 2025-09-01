import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConnected, Database } from '@/lib/supabase'

type UserRow = Database['public']['Tables']['users']['Row']

// CSV export endpoint for user registration data
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is connected
    if (!isSupabaseConnected()) {
      return NextResponse.json(
        { error: 'Supabase connection not available' },
        { status: 503 }
      )
    }

    // Get all users from Supabase
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No user data found' },
        { status: 404 }
      )
    }

    // Define CSV headers
    const headers = [
      'ID',
      'Unique ID',
      'Email',
      'Name',
      'Role',
      'Batch',
      'Department',
      'Phone',
      'Address',
      'Year of Passing',
      'Registration Date',
      'Status',
      'Created At',
      'Updated At'
    ]

    // Convert users data to CSV format
    const csvRows = []
    
    // Add header row
    csvRows.push(headers.join(','))
    
    // Add data rows
    users.forEach((user: UserRow) => {
      const row = [
        user.id || '',
        user.unique_id || '',
        user.email || '',
        `"${(user.name || '').replace(/"/g, '""')}"`, // Escape quotes in names
        user.role || '',
        user.batch || '',
        user.department || '',
        user.phone || '',
        `"${(user.address || '').replace(/"/g, '""')}"`, // Escape quotes in addresses
        user.year_of_passing || '',
        user.registration_date || '',
        user.status || '',
        user.created_at ? new Date(user.created_at).toISOString() : '',
        user.updated_at ? new Date(user.updated_at).toISOString() : ''
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `user-registrations-${timestamp}.csv`

    // Return CSV file as download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Internal server error during CSV export' },
      { status: 500 }
    )
  }
}

// Optional: Add POST endpoint for filtered exports
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filters = {}, format = 'csv' } = body

    if (!isSupabaseConnected()) {
      return NextResponse.json(
        { error: 'Supabase connection not available' },
        { status: 503 }
      )
    }

    // Build query with filters
    let query = supabaseAdmin.from('users').select('*')
    
    if (filters.role) {
      query = query.eq('role', filters.role)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.batch) {
      query = query.eq('batch', filters.batch)
    }
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data: users, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching filtered users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch filtered user data' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No users found matching the filters' },
        { status: 404 }
      )
    }

    // Return JSON format if requested
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        count: users.length,
        data: users
      })
    }

    // Default to CSV format
    const headers = [
      'ID',
      'Email', 
      'Name',
      'Role',
      'Batch',
      'Department',
      'Phone',
      'Address',
      'Year of Passing',
      'Registration Date',
      'Status',
      'Created At',
      'Updated At'
    ]

    const csvRows = []
    csvRows.push(headers.join(','))
    
    users.forEach((user: UserRow) => {
      const row = [
        user.id || '',
        user.email || '',
        `"${(user.name || '').replace(/"/g, '""')}"`,
        user.role || '',
        user.batch || '',
        user.department || '',
        user.phone || '',
        `"${(user.address || '').replace(/"/g, '""')}"`,
        user.year_of_passing || '',
        user.registration_date || '',
        user.status || '',
        user.created_at ? new Date(user.created_at).toISOString() : '',
        user.updated_at ? new Date(user.updated_at).toISOString() : ''
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `filtered-users-${timestamp}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Filtered CSV export error:', error)
    return NextResponse.json(
      { error: 'Internal server error during filtered CSV export' },
      { status: 500 }
    )
  }
}