import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { generateFashionPrompt } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
  try {
    // 1. Check Authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    console.log("Token starts with:", token.substring(0, 20) + "...")
    console.log("Token length:", token.length)
    
    let decodedToken
    try {
      decodedToken = await getAdminAuth().verifyIdToken(token)
      console.log("Token verified successfully for user:", decodedToken.uid)
    } catch (error) {
      console.error('Token verification failed:', error)
      const err = error as { code?: unknown; message?: unknown; stack?: unknown }
      console.error("Error details:", {
        code: err?.code,
        message: err?.message,
        stack: err?.stack
      })
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decodedToken.uid
    console.log('Authenticated user:', userId)

    // 2. Check User Credits
    const userDoc = await getAdminDb().collection('users').doc(userId).get()
    if (!userDoc.exists) {
      console.log('User document not found for:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const availableCredits = userData?.credits || 0
    console.log('User credits:', availableCredits)
    
    if (availableCredits < 0.5) {
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
      const message = error instanceof Error ? error.message : 'Failed to generate prompt'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    // 5. Deduct 0.5 credit after successful prompt generation (OpenAI cost) only if OpenAI was used
    if (promptResult.usedOpenAI) {
      try {
        await getAdminDb().collection('users').doc(userId).update({
          credits: Math.max(0, availableCredits - 0.5),
          updatedAt: new Date()
        })
      } catch (e) {
        console.error('Failed to deduct 0.5 credit after prompt generation:', e)
        // Proceed anyway; optionally queue reconciliation
      }
    }

    // 6. Return the generated prompt
    return NextResponse.json({
      success: true,
      prompt: promptResult.prompt,
      aspect_ratio: promptResult.aspect_ratio
    })

  } catch (error) {
    console.error('Error in generate-prompt endpoint:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
