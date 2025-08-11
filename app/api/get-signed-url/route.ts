import { NextRequest, NextResponse } from 'next/server'
import { getAdminStorage } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Initialize Firebase Admin Storage
    const bucket = getAdminStorage().bucket()
    
    // Extract the file path from the Firebase Storage URL
    // Example URL: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/path%2Fto%2Ffile.jpg?alt=media&token=...
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/o\/(.+)/)
    
    if (!pathMatch) {
      return NextResponse.json({ error: 'Invalid Firebase Storage URL' }, { status: 400 })
    }
    
    // Decode the file path and strip query string if present
    const encodedPath = pathMatch[1]
    const filePath = decodeURIComponent(encodedPath.split('?')[0])
    
    // Get a fresh signed URL
    const [signedUrl] = await bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    })
    
    return NextResponse.json({ signedUrl })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate signed URL'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
