import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

// GET /api/projects - list current user's projects
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]
    const decoded = await getAdminAuth().verifyIdToken(token)
    const uid = decoded.uid

    const snapshot = await getAdminDb()
      .collection('projects')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(projects)
  } catch (error) {
    console.error('GET /api/projects failed:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}


