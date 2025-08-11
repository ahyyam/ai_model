import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check Authentication
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

    // Fetch the project document
    const projectDoc = await getAdminDb().collection('projects').doc(projectId).get()
    
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const projectData = projectDoc.data()
    
    // Check if the user owns this project
    if (projectData?.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Return the project data
    return NextResponse.json({
      id: projectDoc.id,
      ...projectData
    })

  } catch (error) {
    console.error('Error fetching project:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
