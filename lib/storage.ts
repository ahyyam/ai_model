import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

// Storage bucket names
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  PROJECTS: 'projects',
  USER_AVATARS: 'avatars',
} as const

// Upload file to Firebase Storage
export async function uploadFile(
  file: File | Blob,
  path: string,
  bucket: string = STORAGE_BUCKETS.IMAGES
): Promise<string> {
  try {
    const storageRef = ref(storage, `${bucket}/${path}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}

// Upload image with automatic path generation
export async function uploadImage(
  file: File,
  userId: string,
  type: 'garment' | 'reference' | 'generated' | 'avatar' = 'generated'
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${type}_${timestamp}_${file.name}`
  const path = `${userId}/${fileName}`
  
  return uploadFile(file, path, STORAGE_BUCKETS.IMAGES)
}

// Upload project image
export async function uploadProjectImage(
  file: File,
  userId: string,
  projectId: string
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `project_${timestamp}_${file.name}`
  const path = `${userId}/${projectId}/${fileName}`
  
  return uploadFile(file, path, STORAGE_BUCKETS.PROJECTS)
}

// Delete file from Firebase Storage
export async function deleteFile(path: string, bucket: string = STORAGE_BUCKETS.IMAGES): Promise<void> {
  try {
    const storageRef = ref(storage, `${bucket}/${path}`)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
}

// Convert file to base64 (for API calls)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

// Convert base64 to blob
export function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
} 