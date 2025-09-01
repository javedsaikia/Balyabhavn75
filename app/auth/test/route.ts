import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Test route accessed successfully')
  return NextResponse.json({ message: 'Test route working', url: request.url })
}