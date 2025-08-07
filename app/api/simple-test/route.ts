import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log("=== SIMPLE FIRESTORE TEST ===")
    
    // Test 1: Simple write to a test document
    const testData = {
      message: "Hello from Firestore!",
      timestamp: new Date().toISOString(),
      test: true
    }
    
    console.log("Attempting to write test data:", testData)
    
    await adminDb.collection('simple-test').doc('test-1').set(testData)
    
    console.log("✅ Write successful!")
    
    // Test 2: Read it back
    const doc = await adminDb.collection('simple-test').doc('test-1').get()
    
    if (doc.exists) {
      console.log("✅ Read successful! Data:", doc.data())
      return NextResponse.json({ 
        success: true, 
        message: "Firestore is working!",
        data: doc.data()
      })
    } else {
      console.log("❌ Document doesn't exist after write")
      return NextResponse.json({ 
        success: false, 
        message: "Document not found after write"
      })
    }
    
  } catch (error) {
    console.error("❌ Simple test failed:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
