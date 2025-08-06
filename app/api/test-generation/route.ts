import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Generation API is working',
      timestamp: new Date().toISOString(),
      environment: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasRunway: !!process.env.RUNWAY_API_KEY,
        hasFirebase: !!process.env.FIREBASE_PROJECT_ID,
      }
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
