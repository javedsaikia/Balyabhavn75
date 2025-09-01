import { supabase, supabaseAdmin } from './supabase'

// Storage configuration
const BUCKET_NAME = 'photos'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Utility functions
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please use JPEG, PNG, WebP, or GIF' }
  }

  return { valid: true }
}

export const generateFileName = (originalName: string, userId?: string): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const prefix = userId ? `user-${userId}` : 'photo'
  
  return `${prefix}-${timestamp}-${randomId}.${extension}`
}

// Client-side upload function (for authenticated users)
export const uploadPhoto = async (file: File, userId?: string): Promise<{
  success: boolean
  url?: string
  path?: string
  error?: string
}> => {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const fileName = generateFileName(file.name, userId)
    const filePath = userId ? `users/${userId}/${fileName}` : `public/${fileName}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Server-side upload function (using admin client)
export const uploadPhotoAdmin = async (file: File, userId?: string): Promise<{
  success: boolean
  url?: string
  path?: string
  error?: string
}> => {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const fileName = generateFileName(file.name, userId)
    const filePath = userId ? `users/${userId}/${fileName}` : `public/${fileName}`

    // Convert file to buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Admin upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Admin upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Delete photo function
export const deletePhoto = async (filePath: string, useAdmin = false): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    const client = useAdmin ? supabaseAdmin : supabase
    const { error } = await client.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

// Get photo URL function
export const getPhotoUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

// List user photos function
export const listUserPhotos = async (userId: string, useAdmin = false): Promise<{
  success: boolean
  photos?: Array<{ name: string; path: string; url: string; size: number; createdAt: string }>
  error?: string
}> => {
  try {
    const client = useAdmin ? supabaseAdmin : supabase
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .list(`users/${userId}`, {
        limit: 100,
        offset: 0
      })

    if (error) {
      console.error('List photos error:', error)
      return { success: false, error: error.message }
    }

    const photos = data?.map((file: any) => ({
      name: file.name,
      path: `users/${userId}/${file.name}`,
      url: getPhotoUrl(`users/${userId}/${file.name}`),
      size: file.metadata?.size || 0,
      createdAt: file.created_at || ''
    })) || []

    return { success: true, photos }
  } catch (error) {
    console.error('List photos failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list photos'
    }
  }
}

// Storage stats function
export const getStorageStats = async (): Promise<{
  success: boolean
  stats?: { totalFiles: number; totalSize: number }
  error?: string
}> => {
  try {
    // This would require custom implementation or Supabase Edge Functions
    // For now, return basic info
    return {
      success: true,
      stats: {
        totalFiles: 0,
        totalSize: 0
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get storage stats'
    }
  }
}