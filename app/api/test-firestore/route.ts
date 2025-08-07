import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Firestore access via API...")
    
    // Test writing to a test document
    const testDoc = adminDb.collection('test').doc('api-test')
    await testDoc.set({
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Firestore API test successful'
    })
    
    console.log("Firestore API test successful")
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firestore access test successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Firestore API test failed:", error)
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
