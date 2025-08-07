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

export async function createUserData(user: FirebaseUser): Promise<UserData> {
  try {
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await setDoc(doc(db, "users", user.uid), userData)
    return userData
  } catch (error) {
    console.error("Error creating user data:", error)
    throw error
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