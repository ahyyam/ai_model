import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Firebase Admin SDK connection...")
    
    // Test Firestore connection
    const db = getAdminDb()
    console.log("Firestore connection established")
    
    // Test a simple read operation
    const testDoc = await db.collection('users').limit(1).get()
    console.log("Firestore read test successful, found", testDoc.size, "documents")
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin SDK is working properly',
      firestoreTest: 'successful',
      documentCount: testDoc.size
    })
  } catch (error) {
    console.error("Firebase Admin SDK test failed:", error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
