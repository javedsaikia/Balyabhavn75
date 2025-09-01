import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('=== TEST UPLOAD ENDPOINT CALLED ===')
  
  try {
    console.log('Attempting to use Next.js FormData parsing...')
    
    // Try Next.js built-in FormData parsing
    const formData = await request.formData()
    console.log('FormData parsed successfully!')
    
    // Log all form data entries
    console.log('FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }
    
    const photo = formData.get('photo') as File
    const userId = formData.get('userId') as string || 'test-user'
    
    console.log('Extracted data:', {
      hasPhoto: !!photo,
      photoName: photo?.name,
      photoSize: photo?.size,
      photoType: photo?.type,
      userId
    })
    
    if (!photo) {
      return NextResponse.json({
        success: false,
        error: 'No photo file provided'
      }, { status: 400 })
    }
    
    // Basic file validation
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File too large (max 5MB)'
      }, { status: 400 })
    }
    
    // Generate filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `test-${userId}-${timestamp}-${randomId}.${extension}`
    const filePath = `test/${fileName}`
    
    console.log('Generated file path:', filePath)
    
    // Convert photo to buffer
    const buffer = await photo.arrayBuffer()
    
    console.log('File converted to buffer, size:', buffer.byteLength)
    
    // Test Supabase admin client
    console.log('Testing Supabase admin client...')
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Buckets error:', bucketsError)
      return NextResponse.json({
        success: false,
        error: 'Storage connection failed',
        details: bucketsError.message
      }, { status: 500 })
    }
    
    console.log('Available buckets:', buckets?.map((b: any) => b.name))
    
    // Upload to Supabase storage
    console.log('Attempting upload to photos bucket...')
    const { data, error } = await supabaseAdmin.storage
      .from('photos')
      .upload(filePath, buffer, {
        contentType: photo.type,
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({
        success: false,
        error: 'Upload failed',
        details: error.message,
        supabaseError: error
      }, { status: 500 })
    }
    
    console.log('Upload successful:', data)
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('photos')
      .getPublicUrl(data.path)
    
    console.log('Public URL generated:', urlData.publicUrl)
    
    return NextResponse.json({
      success: true,
      message: 'FormData parsing and upload test successful',
      data: {
        url: urlData.publicUrl,
        path: data.path,
        fileName: photo.name,
        fileSize: photo.size,
        fileType: photo.type,
        userId: userId,
        parsingMethod: 'formdata'
      }
    })
    
  } catch (error) {
    console.error('Test upload API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: typeof error
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test upload endpoint - use POST with multipart/form-data'
  })
}