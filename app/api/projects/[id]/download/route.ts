import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    let decodedToken
    try {
      decodedToken = await getAdminAuth().verifyIdToken(token)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decodedToken.uid
    const projectId = params.id

    // Get the project to verify ownership
    const projectRef = getAdminDb().collection('projects').doc(projectId)
    const projectDoc = await projectRef.get()
    
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const projectData = projectDoc.data()
    
    if (projectData?.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the downloads count
    const currentDownloads = projectData.downloads || 0
    await projectRef.update({
      downloads: currentDownloads + 1,
      updatedAt: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      downloads: currentDownloads + 1 
    })

  } catch (error) {
    console.error('Error updating download count:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
