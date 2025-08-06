import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { generateFashionPrompt } from '@/lib/openai'
import { generateImageWithRunway, waitForRunwayGeneration } from '@/lib/runway'
import { uploadImageFromURL, generateImagePath } from '@/lib/storage'
import { doc, setDoc, updateDoc, getDoc } from 'firebase-admin/firestore'

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
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decodedToken.uid

    // 2. Check User Credits
    const userDoc = await getDoc(doc(adminDb, 'users', userId))
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const availableCredits = userData.credits || 0
    if (availableCredits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // 3. Parse request body
    const body = await request.json()
    const { referenceImageURL, garmentImageURL, userPrompt } = body

    if (!referenceImageURL || !garmentImageURL) {
      return NextResponse.json({ error: 'Missing required images' }, { status: 400 })
    }

    // 4. Create project document with initial status
    const projectRef = doc(adminDb, 'projects', userId)
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

    await setDoc(doc(adminDb, 'projects', projectId), projectData)

    // 5. Generate prompt using OpenAI
    let promptResult
    try {
      promptResult = await generateFashionPrompt(referenceImageURL, garmentImageURL, userPrompt)
    } catch (error) {
      console.error('Error generating prompt:', error)
      await updateDoc(doc(adminDb, 'projects', projectId), {
        status: 'error',
        error: 'Failed to generate prompt'
      })
      return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 })
    }

    // 6. Update project with generated prompt
    await updateDoc(doc(adminDb, 'projects', projectId), {
      prompt: promptResult.prompt,
      aspect_ratio: promptResult.aspect_ratio,
      updatedAt: new Date()
    })

    // 7. Generate image using Runway
    let runwayResult
    try {
      runwayResult = await generateImageWithRunway({
        prompt: promptResult.prompt,
        referenceImageURL,
        garmentImageURL,
        aspect_ratio: promptResult.aspect_ratio
      })

      // Wait for generation to complete
      const finalResult = await waitForRunwayGeneration(runwayResult.id)
      
      if (!finalResult.output?.images?.[0]?.url) {
        throw new Error('No image generated')
      }

      const generatedImageURL = finalResult.output.images[0].url

      // 8. Upload final image to Firebase Storage
      const storagePath = generateImagePath(userId, projectId, 'final')
      const finalImageStorageURL = await uploadImageFromURL(generatedImageURL, storagePath)

      // 9. Update project with final image and complete status
      await updateDoc(doc(adminDb, 'projects', projectId), {
        status: 'complete',
        finalImageURL: finalImageStorageURL,
        updatedAt: new Date()
      })

      // 10. Deduct credit from user
      await updateDoc(doc(adminDb, 'users', userId), {
        credits: availableCredits - 1,
        updatedAt: new Date()
      })

      return NextResponse.json({
        success: true,
        projectId,
        finalImageURL: finalImageStorageURL,
        prompt: promptResult.prompt,
        aspect_ratio: promptResult.aspect_ratio
      })

    } catch (error) {
      console.error('Error generating image:', error)
      await updateDoc(doc(adminDb, 'projects', projectId), {
        status: 'error',
        error: 'Failed to generate image'
      })
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in generate endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
