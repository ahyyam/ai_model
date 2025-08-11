import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]
    const decoded = await getAdminAuth().verifyIdToken(token)

    const { uid, updates } = await request.json()
    if (!uid || typeof updates !== 'object' || updates === null) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    if (decoded.uid !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await getAdminDb().collection('users').doc(uid).set(
      { ...updates, updatedAt: new Date().toISOString() },
      { merge: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User update failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


