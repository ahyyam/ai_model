import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { waitForRunwayGeneration } from '@/lib/ai/runway'
import { uploadImageFromURL, generateImagePath } from '@/lib/storage-admin'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decoded = await getAdminAuth().verifyIdToken(token)
    const userId = decoded.uid

    const projectRef = getAdminDb().collection('projects').doc(projectId)
    const snap = await projectRef.get()
    if (!snap.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    const data = snap.data() as any
    if (data.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // If already completed or errored, return current state
    if (data.status === 'complete') {
      return NextResponse.json({ status: 'complete', finalImageURL: data.finalImageURL })
    }
    if (data.status === 'error') {
      return NextResponse.json({ status: 'error', error: data.error })
    }

    const generationId = data.runwayGenerationId
    if (!generationId) {
      return NextResponse.json({ status: 'processing' })
    }

    // Ensure Runway key exists; if not, don't 500 — keep processing and let admin fix env
    const runwaySecret = process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY
    if (!runwaySecret) {
      return NextResponse.json({ status: 'error', error: 'Runway API key is not configured on the server.' }, { status: 500 })
    }

    // Check Runway status (tolerate transient errors)
    let result: any
    try {
      result = await waitForRunwayGeneration(generationId, 1000 * 60 * 1) // 1 minute max per poll
      console.log("Runway result:", JSON.stringify(result, null, 2))
    } catch (e: any) {
      console.error("Runway generation error:", e)
      return NextResponse.json({ status: 'error', error: e?.message || 'Generation failed at provider.' }, { status: 500 })
    }
    
    console.log("Result status:", result.status)
    console.log("Result output:", result.output)
    console.log("Result images:", result.output?.images)
    console.log("First image URL:", result.output?.images?.[0]?.url)
    
    if (result.status !== 'succeeded' || !result.output?.images?.[0]?.url) {
      console.log("Returning processing status - no valid image URL found")
      return NextResponse.json({ status: 'processing' })
    }

    // Persist final image and mark complete
    const generatedImageURL = result.output.images[0].url
    const storagePath = generateImagePath(userId, projectId, 'final')
    let finalImageStorageURL: string
    try {
      finalImageStorageURL = await uploadImageFromURL(generatedImageURL, storagePath)
    } catch (e: any) {
      return NextResponse.json({ status: 'error', error: e?.message || 'Failed to persist generated image.' }, { status: 500 })
    }

    await projectRef.update({
      status: 'complete',
      finalImageURL: finalImageStorageURL,
      updatedAt: new Date()
    })

    return NextResponse.json({ status: 'complete', finalImageURL: finalImageStorageURL })
  } catch (error) {
    console.error('Error in generation status endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


