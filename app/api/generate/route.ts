import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { generateFashionPrompt } from '@/lib/openai'
import { generateImageWithRunway } from '@/lib/runway'

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
      decodedToken = await getAdminAuth().verifyIdToken(token)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decodedToken.uid

    // 2. Check User Credits
    const userDoc = await getAdminDb().collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const availableCredits = userData.credits || 0
    if (availableCredits < 0.5) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // 3. Parse request body
    const body = await request.json()
    const { referenceImageURL, garmentImageURL, userPrompt } = body

    if (!referenceImageURL || !garmentImageURL) {
      return NextResponse.json({ error: 'Missing required images' }, { status: 400 })
    }

    // 4. Create project document with initial status
    const projectId = `${userId}_${Date.now()}`
    
    const projectData = {
      userId,
      status: 'processing',
      referenceImageURL,
      garmentImageURL,
      finalImageURL: '',
      prompt: '',
      aspect_ratio: '',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await getAdminDb().collection('projects').doc(projectId).set(projectData)

    // 5. Generate prompt using OpenAI
    let promptResult
    try {
      promptResult = await generateFashionPrompt(referenceImageURL, garmentImageURL, userPrompt)
    } catch (error) {
      console.error('Error generating prompt:', error)
      await getAdminDb().collection('projects').doc(projectId).update({
        status: 'error',
        error: 'Failed to generate prompt'
      })
      const message = error instanceof Error ? error.message : 'Failed to generate prompt'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    // 6. Update project with generated prompt
    await getAdminDb().collection('projects').doc(projectId).update({
      prompt: promptResult.prompt,
      aspect_ratio: promptResult.aspect_ratio,
      updatedAt: new Date()
    })

    // 7. Kick off Runway task (fast) and return immediately
    try {
      const runwayResult = await generateImageWithRunway({
        prompt: promptResult.prompt,
        referenceImageURL,
        garmentImageURL,
        aspect_ratio: promptResult.aspect_ratio
      })

      // Save generation id and keep status processing
      await getAdminDb().collection('projects').doc(projectId).update({
        status: 'processing',
        runwayGenerationId: runwayResult.id,
        updatedAt: new Date()
      })

      // Deduct 0.5 credit for Runway kick-off
      try {
        await getAdminDb().collection('users').doc(userId).update({
          credits: Math.max(0, availableCredits - 0.5),
          updatedAt: new Date()
        })
      } catch (e) {
        console.error('Failed to deduct 0.5 credit after Runway start:', e)
        // Continue; reconciliation could adjust balances later
      }

      // If OpenAI was used here (no userPrompt provided and API key available), deduct extra 0.5
      if (promptResult.usedOpenAI) {
        try {
          const refreshedUserDoc = await getAdminDb().collection('users').doc(userId).get()
          const refreshedCredits = (refreshedUserDoc.data()?.credits || availableCredits) as number
          await getAdminDb().collection('users').doc(userId).update({
            credits: Math.max(0, refreshedCredits - 0.5),
            updatedAt: new Date()
          })
        } catch (e) {
          console.error('Failed to deduct 0.5 credit for OpenAI prompt generation within /api/generate:', e)
        }
      }

      return NextResponse.json({
        started: true,
        projectId,
        generationId: runwayResult.id,
        prompt: promptResult.prompt,
        aspect_ratio: promptResult.aspect_ratio
      }, { status: 202 })
    } catch (error) {
      console.error('Error starting generation:', error)
      await getAdminDb().collection('projects').doc(projectId).update({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start generation'
      })
      const message = error instanceof Error ? error.message : 'Failed to start generation'
      return NextResponse.json({ error: message }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in generate endpoint:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
