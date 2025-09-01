import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('\n=== DEBUG REQUEST ENDPOINT ===');
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Headers:');
  
  for (const [key, value] of request.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  try {
    // Try to read the body as text first
    const bodyText = await request.text();
    console.log('\nBody length:', bodyText.length);
    console.log('Body preview (first 200 chars):', bodyText.substring(0, 200));
    
    return NextResponse.json({
      success: true,
      bodyLength: bodyText.length,
      bodyPreview: bodyText.substring(0, 200),
      headers: Object.fromEntries(request.headers.entries())
    });
  } catch (error) {
    console.error('Error reading body:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to read request body',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Debug endpoint is working' });
}