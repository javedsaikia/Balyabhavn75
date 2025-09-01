import { NextRequest, NextResponse } from 'next/server'
import { uploadPhotoAdmin, validateFile } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('photo') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No photo file provided'
      }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 })
    }

    // Upload photo using admin client
    const result = await uploadPhotoAdmin(file, userId)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Upload failed'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        url: result.url,
        path: result.path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    })
  } catch (error) {
    console.error('Photo upload API error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      error: error
    })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during upload'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve user photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // This would typically require authentication middleware
    // For now, we'll return a simple response
    return NextResponse.json({
      success: true,
      message: 'Photo retrieval endpoint',
      userId
    })
  } catch (error) {
    console.error('Photo retrieval API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during retrieval'
    }, { status: 500 })
  }
}