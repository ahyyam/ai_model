import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadImageToStorage(
  file: File,
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Error uploading image to storage:', error)
    throw error
  }
}

export async function uploadBase64ToStorage(
  base64Data: string,
  path: string
): Promise<string> {
  try {
    // Convert base64 to blob
    const response = await fetch(base64Data)
    const blob = await response.blob()
    
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, blob)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Error uploading base64 to storage:', error)
    throw error
  }
}

export async function uploadImageFromURL(
  imageURL: string,
  path: string
): Promise<string> {
  try {
    // Fetch the image from URL
    const response = await fetch(imageURL)
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.status}`)
    }
    
    const blob = await response.blob()
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, blob)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error('Error uploading image from URL:', error)
    throw error
  }
}

// Helper function to generate unique file paths
export function generateImagePath(
  userId: string,
  projectId: string,
  imageType: 'garment' | 'reference' | 'final' | 'version',
  version?: number
): string {
  const timestamp = Date.now()
  
  switch (imageType) {
    case 'garment':
      return `projects/${userId}/${projectId}/garment-${timestamp}.jpg`
    case 'reference':
      return `projects/${userId}/${projectId}/reference-${timestamp}.jpg`
    case 'final':
      return `projects/${userId}/${projectId}/final-${timestamp}.jpg`
    case 'version':
      return `projects/${userId}/${projectId}/version-${version}-${timestamp}.jpg`
    default:
      return `projects/${userId}/${projectId}/image-${timestamp}.jpg`
  }
} 