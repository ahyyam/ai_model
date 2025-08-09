import { getAdminStorage } from "@/lib/firebase-admin"

export async function uploadImageFromURL(
  imageURL: string,
  path: string
): Promise<string> {
  const bucket = getAdminStorage().bucket()
  const file = bucket.file(path)

  const res = await fetch(imageURL)
  if (!res.ok) {
    throw new Error(`Failed to fetch image from URL: ${res.status}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  await file.save(buffer, {
    metadata: {
      contentType: res.headers.get("content-type") || "image/jpeg",
      cacheControl: "public, max-age=31536000, immutable",
    },
    resumable: false,
  })

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  })

  return signedUrl
}

// Helper function to generate unique file paths
export function generateImagePath(
  userId: string,
  projectId: string,
  imageType: "garment" | "reference" | "final" | "version",
  version?: number
): string {
  const timestamp = Date.now()

  switch (imageType) {
    case "garment":
      return `projects/${userId}/${projectId}/garment-${timestamp}.jpg`
    case "reference":
      return `projects/${userId}/${projectId}/reference-${timestamp}.jpg`
    case "final":
      return `projects/${userId}/${projectId}/final-${timestamp}.jpg`
    case "version":
      return `projects/${userId}/${projectId}/version-${version}-${timestamp}.jpg`
    default:
      return `projects/${userId}/${projectId}/image-${timestamp}.jpg`
  }
}