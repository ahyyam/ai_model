import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const results = {
    adminWrite: false,
    adminRead: false,
    error: null as string | null
  }

  try {
    console.log("Testing admin Firestore access...")
    
    // Test 1: Write to test collection
    try {
      const testDoc = adminDb.collection('test').doc('admin-test')
      await testDoc.set({
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Admin write test successful'
      })
      results.adminWrite = true
      console.log("Admin write test successful")
    } catch (writeError) {
      console.error("Admin write test failed:", writeError)
      results.error = `Write error: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`
    }

    // Test 2: Read from test collection
    try {
      const testDoc = adminDb.collection('test').doc('admin-test')
      const doc = await testDoc.get()
      if (doc.exists) {
        results.adminRead = true
        console.log("Admin read test successful")
      }
    } catch (readError) {
      console.error("Admin read test failed:", readError)
      if (!results.error) {
        results.error = `Read error: ${readError instanceof Error ? readError.message : 'Unknown error'}`
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({ 
      adminWrite: false,
      adminRead: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
