import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { generateImageWithRunway, waitForRunwayGeneration } from '@/lib/runway'
import { uploadImageFromURL, generateImagePath } from '@/lib/storage'
import { FieldValue } from 'firebase-admin/firestore'

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
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const availableCredits = userData?.credits || 0
    if (availableCredits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // 3. Parse request body
    const body = await request.json()
    const { projectId, newPrompt } = body

    if (!projectId || !newPrompt) {
      return NextResponse.json({ error: 'Missing projectId or newPrompt' }, { status: 400 })
    }

    // 4. Fetch original project data
    const projectDoc = await adminDb.collection('projects').doc(projectId).get()
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const projectData = projectDoc.data()
    
    // Check if project belongs to user
    if (projectData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 })
    }

    // Check if project is complete
    if (projectData?.status !== 'complete') {
      return NextResponse.json({ error: 'Project is not ready for editing' }, { status: 400 })
    }

    // 5. Update project status to processing
    await adminDb.collection('projects').doc(projectId).update({
      status: 'processing',
      updatedAt: new Date()
    })

    // 6. Generate new image using Runway with original images and new prompt
    let runwayResult
    try {
      runwayResult = await generateImageWithRunway({
        prompt: newPrompt,
        referenceImageURL: projectData.referenceImageURL,
        garmentImageURL: projectData.garmentImageURL,
        aspect_ratio: projectData.aspect_ratio
      })

      // Wait for generation to complete
      const finalResult = await waitForRunwayGeneration(runwayResult.id)
      
      if (!finalResult.output?.images?.[0]?.url) {
        throw new Error('No image generated')
      }

      const generatedImageURL = finalResult.output.images[0].url

      // 7. Upload new version to Firebase Storage
      const newVersion = (projectData.version || 1) + 1
      const storagePath = generateImagePath(userId, projectId, 'version', newVersion)
      const newVersionStorageURL = await uploadImageFromURL(generatedImageURL, storagePath)

      // 8. Create version metadata
      const versionMetadata = {
        version: newVersion,
        prompt: newPrompt,
        finalImageURL: newVersionStorageURL,
        status: 'complete',
        createdAt: new Date()
      }

      // 9. Update project with new version
      await adminDb.collection('projects').doc(projectId).update({
        status: 'complete',
        updatedAt: new Date(),
        version: newVersion,
        versions: FieldValue.arrayUnion(versionMetadata)
      })

      // 10. Deduct credit from user
      await adminDb.collection('users').doc(userId).update({
        credits: availableCredits - 1,
        updatedAt: new Date()
      })

      return NextResponse.json({
        success: true,
        version: newVersion,
        finalImageURL: newVersionStorageURL,
        prompt: newPrompt
      })

    } catch (error) {
      // Revert project status on error
      await adminDb.collection('projects').doc(projectId).update({
        status: 'complete',
        updatedAt: new Date()
      })
      
      console.error('Error generating image:', error)
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in edit API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
