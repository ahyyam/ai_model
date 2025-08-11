import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "./firebase"
import { testFirebaseConnection } from "./firebase"
import { User as FirebaseUser } from "firebase/auth"

export interface UserData {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  stripeCustomerId?: string
  subscriptionStatus?: 'free' | 'basic' | 'pro' | 'elite'
  credits?: number
  createdAt: string
  updatedAt: string
}

// Utility to remove undefined values from objects before Firestore writes
function omitUndefined<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) cleaned[key] = value
  }
  return cleaned as T
}

// Credit allocation based on subscription plans
const PLAN_CREDITS = {
  BASIC: 10,
  PRO: 20,
  ELITE: 50,
  MINI: 5,
  STANDARD: 15,
  PLUS: 25
}

export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("Error fetching user data:", error)
    // Return null if there's an error (offline, etc.)
    return null
  }
}

// Test function to check if Firestore is accessible
// removed testFirestoreAccess (unused)

export async function createUserData(user: FirebaseUser): Promise<UserData> {
  try {
    console.log("Creating user data for:", user.uid, user.email)
    
    if (!user.uid || !user.email) {
      throw new Error("Invalid user data: missing uid or email")
    }
    
    // Test Firebase connection first
    try {
      await testFirebaseConnection()
    } catch (connectionError) {
      console.error("Firebase connection test failed:", connectionError)
      // Continue anyway, the server-side fallback should work
    }
    
    const baseData: UserData = {
      uid: user.uid,
      email: user.email,
      subscriptionStatus: 'free',
      credits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const optionalData: Partial<UserData> = {}
    if (user.displayName) optionalData.displayName = user.displayName
    if (user.photoURL) optionalData.photoURL = user.photoURL

    const userData: UserData = { ...baseData, ...optionalData }

    console.log("User data to create:", userData)
    
    // Check if user already exists
    const existingUser = await getUserData(user.uid)
    if (existingUser) {
      console.log("User already exists, returning existing data")
      return existingUser
    }
    
    // Ensure user is properly authenticated before attempting client-side write
    try {
      const token = await user.getIdToken(true) // Force token refresh
      if (!token) {
        throw new Error("User not properly authenticated")
      }
      
      // Add a small delay to ensure Firebase Auth state is propagated
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Try to create the user document client-side
      await setDoc(doc(db, "users", user.uid), omitUndefined(userData))
      console.log("User data created successfully for:", user.uid)
      return userData
    } catch (writeError) {
      console.error("Client-side write failed, trying server-side fallback:", writeError)
      
      // If client-side fails, try server-side API as fallback
      try {
        const response = await fetch('/api/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Server-side creation failed')
        }

        const result = await response.json()
        console.log("User data created successfully via server-side fallback for:", user.uid)
        return result.userData
      } catch (serverError) {
        console.error("Server-side fallback also failed:", serverError)
        
        // Provide detailed error information
        if (writeError instanceof Error) {
          if (writeError.message.includes('permission-denied') || writeError.message.includes('Missing or insufficient permissions')) {
            throw new Error("Firebase permission denied. This usually happens when the user is not fully authenticated yet. Please try again in a few seconds.")
          } else if (writeError.message.includes('unavailable') || writeError.message.includes('network')) {
            throw new Error("Firebase service unavailable. Please check your internet connection and try again.")
          } else if (writeError.message.includes('quota-exceeded')) {
            throw new Error("Firebase quota exceeded. Please contact support.")
          } else {
            throw new Error(`Failed to create user data: ${writeError.message}`)
          }
        } else {
          throw new Error("Failed to create user data: Unknown write error")
        }
      }
    }
  } catch (error) {
    console.error("Error creating user data:", error)
    
    // Re-throw the error with more context
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error("Failed to create user data: Unknown error")
    }
  }
}

export async function updateUserData(uid: string, updates: Partial<UserData>): Promise<void> {
  try {
    const updateData = omitUndefined({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    
    try {
      await updateDoc(doc(db, "users", uid), updateData)
    } catch (err) {
      // Permission fallback: call server route with Admin SDK
      const token = await (await import('firebase/auth')).getAuth().currentUser?.getIdToken()
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ uid, updates: updateData }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        throw new Error(data.error || 'Failed to update user via server')
      }
    }
  } catch (error) {
    console.error("Error updating user data:", error)
    throw error
  }
}

export async function setStripeCustomerId(uid: string, stripeCustomerId: string): Promise<void> {
  try {
    await updateUserData(uid, { stripeCustomerId })
  } catch (error) {
    console.error("Error setting Stripe customer ID:", error)
    throw error
  }
}

export async function updateSubscriptionStatus(uid: string, status: 'free' | 'basic' | 'pro' | 'elite'): Promise<void> {
  try {
    await updateUserData(uid, { subscriptionStatus: status })
  } catch (error) {
    console.error("Error updating subscription status:", error)
    throw error
  }
}

export async function updateUserCredits(uid: string, credits: number): Promise<void> {
  try {
    await updateUserData(uid, { credits })
  } catch (error) {
    console.error("Error updating user credits:", error)
    throw error
  }
}

export async function deductUserCredit(uid: string): Promise<boolean> {
  try {
    const userData = await getUserData(uid)
    if (!userData) {
      throw new Error("User data not found")
    }

    const currentCredits = userData.credits || 0
    if (currentCredits <= 0) {
      return false // No credits available
    }

    await updateUserCredits(uid, currentCredits - 1)
    return true // Credit deducted successfully
  } catch (error) {
    console.error("Error deducting user credit:", error)
    throw error
  }
}

// New function to sync subscription status from Stripe
export async function syncSubscriptionFromStripe(uid: string): Promise<UserData | null> {
  try {
    // Allow disabling sync to avoid 404s on hosts without the API route
    const syncEnabled = process.env.NEXT_PUBLIC_ENABLE_STRIPE_SYNC === 'true'
    if (!syncEnabled) {
      return await getUserData(uid)
    }

    const userData = await getUserData(uid)
    if (!userData || !userData.stripeCustomerId) {
      return userData
    }

    // Call the new sync API endpoint
    const response = await fetch('/api/stripe/sync-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    })

    if (!response.ok) {
      console.error("Failed to sync subscription from Stripe")
      return userData
    }

    const syncData = await response.json()
    
    if (syncData.error) {
      console.error("Error syncing subscription:", syncData.error)
      return userData
    }

    // Update user data with synced information
    const updatedData = {
      subscriptionStatus: syncData.subscriptionStatus,
      credits: syncData.credits,
      updatedAt: new Date().toISOString()
    }

    await updateUserData(uid, updatedData)
    return { ...userData, ...updatedData }
  } catch (error) {
    console.error("Error syncing subscription from Stripe:", error)
    return null
  }
} 