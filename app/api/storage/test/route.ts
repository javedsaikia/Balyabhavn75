import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test storage connection and list buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to storage',
        details: bucketsError.message
      }, { status: 500 })
    }

    // Check if photos bucket exists
    const photosBucket = buckets?.find((bucket: any) => bucket.name === 'photos')
    
    return NextResponse.json({
      success: true,
      buckets: buckets?.map((b: any) => ({ name: b.name, id: b.id, public: b.public })),
      photosBucketExists: !!photosBucket,
      photosBucket: photosBucket ? {
        name: photosBucket.name,
        id: photosBucket.id,
        public: photosBucket.public,
        createdAt: photosBucket.created_at,
        updatedAt: photosBucket.updated_at
      } : null
    })
  } catch (error) {
    console.error('Storage test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Storage test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Create photos bucket if it doesn't exist
export async function POST() {
  try {
    const { data: bucket, error } = await supabaseAdmin.storage.createBucket('photos', {
      public: false, // Private bucket for security
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB limit
    })

    if (error) {
      console.error('Error creating bucket:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create photos bucket',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Photos bucket created successfully',
      bucket: {
        name: bucket.name,
        id: bucket.id
      }
    })
  } catch (error) {
    console.error('Bucket creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Bucket creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}