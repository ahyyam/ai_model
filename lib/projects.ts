"use client"

import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface Project {
  id: string
  name: string
  createdAt: string
  status: string
  thumbnail: string
  aesthetic: string
  downloads: number
  generatedImages: string[]
  garmentImage?: string
  referenceImage?: string
  prompt?: string
}

export async function addProject(newProjectData: Omit<Project, "id" | "createdAt">): Promise<Project | null> {
  const user = auth.currentUser
  if (!user) return null
  const docRef = await addDoc(collection(db, "projects"), {
    ...newProjectData,
    userId: user.uid,
    createdAt: Timestamp.now(),
  })
  return {
    ...newProjectData,
    id: docRef.id,
    createdAt: new Date().toISOString(),
  }
}

export async function getProjectsForUser(): Promise<Project[]> {
  const user = auth.currentUser
  if (!user) return []
  
  try {
    const q = query(collection(db, "projects"), where("userId", "==", user.uid))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        createdAt: data.createdAt?.toDate().toISOString() || "",
        status: data.status,
        thumbnail: data.thumbnail,
        aesthetic: data.aesthetic,
        downloads: data.downloads,
        generatedImages: data.generatedImages,
        garmentImage: data.garmentImage,
        referenceImage: data.referenceImage,
        prompt: data.prompt,
      }
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    // Return empty array if there's an error (offline, etc.)
    return []
  }
}
