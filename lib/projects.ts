"use client"

import { collection, addDoc, getDocs, query, where, Timestamp, doc, getDoc, deleteDoc } from "firebase/firestore"
import { auth, db, storage } from "@/lib/firebase"
import { ref, listAll, deleteObject } from "firebase/storage"

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
      const data = doc.data() as any
      const finalImageURL: string | undefined = data.finalImageURL
      const garmentImage: string | undefined = data.garmentImage || data.garmentImageURL
      const referenceImage: string | undefined = data.referenceImage || data.referenceImageURL
      const generatedImages: string[] | undefined = Array.isArray(data.generatedImages) && data.generatedImages.length
        ? data.generatedImages
        : (finalImageURL ? [finalImageURL] : undefined)
      const thumbnail: string = data.thumbnail || finalImageURL || garmentImage || "/placeholder.svg"
      const name: string = data.name || (data.prompt ? (String(data.prompt).slice(0, 64)) : "AI Photo Shoot")

      return {
        id: doc.id,
        userId: data.userId,
        name,
        createdAt: data.createdAt?.toDate?.().toISOString?.() || data.createdAt || "",
        updatedAt: data.updatedAt?.toDate?.().toISOString?.() || data.updatedAt || "",
        status: data.status,
        thumbnail,
        aesthetic: data.aesthetic,
        downloads: data.downloads || 0,
        generatedImages,
        garmentImage,
        referenceImage,
        finalImageURL,
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
      const data = docSnap.data() as any
      // Check if the project belongs to the current user
      if (data.userId === user.uid) {
        const finalImageURL: string | undefined = data.finalImageURL
        const garmentImage: string | undefined = data.garmentImage || data.garmentImageURL
        const referenceImage: string | undefined = data.referenceImage || data.referenceImageURL
        const generatedImages: string[] | undefined = Array.isArray(data.generatedImages) && data.generatedImages.length
          ? data.generatedImages
          : (finalImageURL ? [finalImageURL] : undefined)
        const thumbnail: string = data.thumbnail || finalImageURL || garmentImage || "/placeholder.svg"
        const name: string = data.name || (data.prompt ? (String(data.prompt).slice(0, 64)) : "AI Photo Shoot")

        return {
          id: docSnap.id,
          userId: data.userId,
          name,
          createdAt: data.createdAt?.toDate?.().toISOString?.() || data.createdAt || "",
          updatedAt: data.updatedAt?.toDate?.().toISOString?.() || data.updatedAt || "",
          status: data.status,
          thumbnail,
          aesthetic: data.aesthetic,
          downloads: data.downloads || 0,
          generatedImages,
          garmentImage,
          referenceImage,
          finalImageURL,
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

/**
 * Recursively delete all files under a storage folder
 */
async function deleteStorageFolderRecursively(folderRef: ReturnType<typeof ref>): Promise<void> {
  const listResult = await listAll(folderRef)
  if (listResult.items.length > 0) {
    await Promise.all(listResult.items.map((itemRef) => deleteObject(itemRef)))
  }
  if (listResult.prefixes.length > 0) {
    await Promise.all(listResult.prefixes.map((subFolderRef) => deleteStorageFolderRecursively(subFolderRef)))
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("Not authenticated")

  // Verify ownership
  const projectRef = doc(db, "projects", projectId)
  const snapshot = await getDoc(projectRef)
  if (!snapshot.exists()) {
    // Nothing to delete
    return
  }
  const data = snapshot.data() as { userId?: string }
  if (data.userId !== user.uid) {
    throw new Error("Permission denied: cannot delete another user's project")
  }

  // Best-effort delete of storage assets first
  try {
    const folderRef = ref(storage, `projects/${user.uid}/${projectId}`)
    await deleteStorageFolderRecursively(folderRef)
  } catch (err) {
    // Non-fatal; continue with document deletion
    console.error("Error deleting project storage assets:", err)
  }

  // Delete the Firestore document
  await deleteDoc(projectRef)
}
