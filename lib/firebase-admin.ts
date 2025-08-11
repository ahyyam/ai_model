import { initializeApp, cert, App, getApps } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'

let adminApp: App | null = null

function initAdminApp(): App {
  if (adminApp) return adminApp
  
  console.log("Initializing Firebase Admin SDK...")
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

  console.log("FIREBASE_PROJECT_ID exists:", !!projectId)
  console.log("FIREBASE_CLIENT_EMAIL exists:", !!clientEmail)
  console.log("FIREBASE_PRIVATE_KEY exists:", !!privateKey)
  console.log("FIREBASE_STORAGE_BUCKET exists:", !!storageBucket)

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Firebase Admin credentials are missing")
    throw new Error(
      'Firebase Admin credentials are not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    )
  }

  try {
    // Check if Firebase app already exists
    const existingApps = getApps()
    if (existingApps.length > 0) {
      console.log("Using existing Firebase app")
      adminApp = existingApps[0]
    } else {
      console.log("Creating new Firebase app")
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket,
      })
    }
    console.log("Firebase Admin SDK initialized successfully")
    
    // Test Firestore connection
    try {
      const testDb = getFirestore(adminApp)
      console.log("Firestore connection test successful")
    } catch (dbError) {
      console.error("Firestore connection test failed:", dbError)
    }
    
    return adminApp
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error)
    // If there's a duplicate app error, try to get the existing app
    const err = error as { code?: unknown }
    if (err && err.code === 'app/duplicate-app') {
      console.log("Duplicate app detected, using existing app")
      const existingApps = getApps()
      if (existingApps.length > 0) {
        adminApp = existingApps[0]
        return adminApp
      }
    }
    throw error
  }
}

export function getAdminApp(): App {
  return adminApp ?? initAdminApp()
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp())
}
