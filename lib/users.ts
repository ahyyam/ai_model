import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
export async function testFirestoreAccess(): Promise<boolean> {
  try {
    console.log("Testing Firestore access...")
    const testDoc = doc(db, "test", "test")
    await setDoc(testDoc, { test: true, timestamp: new Date().toISOString() })
    console.log("Firestore access test successful")
    return true
  } catch (error) {
    console.error("Firestore access test failed:", error)
    return false
  }
}

export async function createUserData(user: FirebaseUser): Promise<UserData> {
  try {
    console.log("Creating user data for:", user.uid, user.email)
    
    if (!user.uid || !user.email) {
      throw new Error("Invalid user data: missing uid or email")
    }
    
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      subscriptionStatus: 'free',
      credits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("User data to create:", userData)
    
    // Check if user already exists
    const existingUser = await getUserData(user.uid)
    if (existingUser) {
      console.log("User already exists, returning existing data")
      return existingUser
    }
    
    // Try to create the user document
    try {
      await setDoc(doc(db, "users", user.uid), userData)
      console.log("User data created successfully for:", user.uid)
      return userData
    } catch (writeError) {
      console.error("Error writing to Firestore:", writeError)
      
      // Check if it's a permission error
      if (writeError instanceof Error) {
        if (writeError.message.includes('permission-denied') || writeError.message.includes('Missing or insufficient permissions')) {
          throw new Error("Firebase permission denied. Please check Firestore security rules. Users need permission to write to their own documents.")
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
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    await updateDoc(doc(db, "users", uid), updateData)
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