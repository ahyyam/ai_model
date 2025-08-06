"use client"

import { collection, addDoc, getDocs, query, where, Timestamp, doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface Project {
  id: string
  userId: string
  name: string
  createdAt: string
  updatedAt: string
  status: 'processing' | 'complete' | 'error'
  thumbnail: string
  aesthetic?: string
  downloads: number
  generatedImages: string[]
  garmentImage?: string
  referenceImage?: string
  finalImageURL?: string
  prompt?: string
  aspect_ratio?: string
  version?: number
  versions?: Array<{
    version: number
    prompt: string
    finalImageURL: string
    status: string
    createdAt: string
  }>
  error?: string
}

export async function addProject(newProjectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "userId">): Promise<Project | null> {
  const user = auth.currentUser
  if (!user) return null
  const docRef = await addDoc(collection(db, "projects"), {
    ...newProjectData,
    userId: user.uid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return {
    ...newProjectData,
    id: docRef.id,
    userId: user.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
        userId: data.userId,
        name: data.name,
        createdAt: data.createdAt?.toDate().toISOString() || "",
        updatedAt: data.updatedAt?.toDate().toISOString() || "",
        status: data.status,
        thumbnail: data.thumbnail,
        aesthetic: data.aesthetic,
        downloads: data.downloads,
        generatedImages: data.generatedImages,
        garmentImage: data.garmentImage,
        referenceImage: data.referenceImage,
        finalImageURL: data.finalImageURL,
        prompt: data.prompt,
        aspect_ratio: data.aspect_ratio,
        version: data.version,
        versions: data.versions,
        error: data.error,
      }
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    // Return empty array if there's an error (offline, etc.)
    return []
  }
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const user = auth.currentUser
  if (!user) return null
  
  try {
    const docRef = doc(db, "projects", projectId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      // Check if the project belongs to the current user
      if (data.userId === user.uid) {
        return {
          id: docSnap.id,
          userId: data.userId,
          name: data.name,
          createdAt: data.createdAt?.toDate().toISOString() || "",
          updatedAt: data.updatedAt?.toDate().toISOString() || "",
          status: data.status,
          thumbnail: data.thumbnail,
          aesthetic: data.aesthetic,
          downloads: data.downloads,
          generatedImages: data.generatedImages,
          garmentImage: data.garmentImage,
          referenceImage: data.referenceImage,
          finalImageURL: data.finalImageURL,
          prompt: data.prompt,
          aspect_ratio: data.aspect_ratio,
          version: data.version,
          versions: data.versions,
          error: data.error,
        }
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
}
