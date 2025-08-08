import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { generateFashionPrompt } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // 1. Check Authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decodedToken.uid
    console.log('Authenticated user:', userId)

    // 2. Check User Credits
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      console.log('User document not found for:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const availableCredits = userData?.credits || 0
    console.log('User credits:', availableCredits)
    
    if (availableCredits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // 3. Parse request body
    const body = await request.json()
    const { referenceImageURL, garmentImageURL, userPrompt } = body

    if (!referenceImageURL || !garmentImageURL) {
      return NextResponse.json({ error: 'Missing required images' }, { status: 400 })
    }

    // 4. Generate prompt using OpenAI
    let promptResult
    try {
      console.log("Generating prompt for user:", userId)
      promptResult = await generateFashionPrompt(referenceImageURL, garmentImageURL, userPrompt)
      console.log("Prompt generated successfully:", promptResult)
    } catch (error) {
      console.error('Error generating prompt:', error)
      return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 })
    }

    // 5. Return the generated prompt
    return NextResponse.json({
      success: true,
      prompt: promptResult.prompt,
      aspect_ratio: promptResult.aspect_ratio
    })

  } catch (error) {
    console.error('Error in generate-prompt endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
