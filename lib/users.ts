import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { User as FirebaseUser } from "firebase/auth"

export interface UserData {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  stripeCustomerId?: string
  subscriptionStatus?: 'free' | 'pro' | 'enterprise'
  createdAt: string
  updatedAt: string
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

export async function updateSubscriptionStatus(uid: string, status: 'free' | 'pro' | 'enterprise'): Promise<void> {
  try {
    await updateUserData(uid, { subscriptionStatus: status })
  } catch (error) {
    console.error("Error updating subscription status:", error)
    throw error
  }
} 