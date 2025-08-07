import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName, photoURL } = await request.json()
    
    if (!uid || !email) {
      return NextResponse.json({ error: 'UID and email are required' }, { status: 400 })
    }

    // Verify the user exists in Firebase Auth
    try {
      await adminAuth.getUser(uid)
    } catch (authError) {
      return NextResponse.json({ error: 'User not found in Firebase Auth' }, { status: 404 })
    }

    // Check if user document already exists
    const existingDoc = await adminDb.collection('users').doc(uid).get()
    if (existingDoc.exists) {
      return NextResponse.json({ 
        success: true, 
        message: 'User already exists',
        userData: existingDoc.data()
      })
    }

    // Create user document
    const userData = {
      uid,
      email,
      displayName: displayName || undefined,
      photoURL: photoURL || undefined,
      subscriptionStatus: 'free',
      credits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await adminDb.collection('users').doc(uid).set(userData)
    
    console.log("User data created successfully via admin SDK for:", uid)
    
    return NextResponse.json({ 
      success: true, 
      message: 'User data created successfully',
      userData
    })
  } catch (error) {
    console.error("Error creating user via admin SDK:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
