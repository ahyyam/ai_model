"use client"

export const dynamic = "force-dynamic"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { addProject } from "@/lib/projects"
import { TopNav } from "@/components/dashboard/top-nav"

export default function ResultsPage() {
  const router = useRouter()
  const [garmentImage, setGarmentImage] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        router.replace("/login")
      }
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    // Try to get last generated project from localStorage
    const lastGeneratedProject = localStorage.getItem("lastGeneratedProject")
    if (lastGeneratedProject) {
      const data = JSON.parse(lastGeneratedProject)
      setGarmentImage(data.garmentImage || null)
      setReferenceImage(data.referenceImage || null)
      setPrompt(data.prompt || "")
      setGeneratedImage(data.generatedImages?.[0] || null)
      setIsGenerating(false)
    } else {
      // Fallback to onboarding state for non-logged-in users
      const onboardingState = localStorage.getItem("onboardingState")
      if (onboardingState) {
        const data = JSON.parse(onboardingState)
        setGarmentImage(data.garmentImage || null)
        setReferenceImage(data.referenceImage || null)
        setPrompt(data.prompt || "")
        setGeneratedImage(data.generatedImage || null)
        setIsGenerating(data.isGenerating || false)
      }
    }
  }, [])

  const handleDownloadImage = async () => {
    if (!generatedImage) {
      console.error("No generated image to download")
      return
    }

    try {
      console.log("Attempting to download image from:", generatedImage)
      
      // Check if it's a Firebase Storage URL that might need authentication
      const isFirebaseUrl = generatedImage.includes('firebasestorage.googleapis.com')
      
      let response
      if (isFirebaseUrl && user) {
        // For Firebase URLs, try to get a fresh signed URL
        console.log("Firebase URL detected, attempting to get fresh signed URL")
        try {
          const token = await user.getIdToken()
          const signedUrlResponse = await fetch('/api/get-signed-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ imageUrl: generatedImage })
          })
          
          if (signedUrlResponse.ok) {
            const { signedUrl } = await signedUrlResponse.json()
            console.log("Got fresh signed URL:", signedUrl)
            response = await fetch(signedUrl)
          } else {
            console.log("Failed to get signed URL, trying direct fetch")
            response = await fetch(generatedImage)
          }
        } catch (tokenError) {
          console.log("Token error, trying direct fetch:", tokenError)
          response = await fetch(generatedImage)
        }
      } else {
        // For other URLs, try direct fetch
        response = await fetch(generatedImage)
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }

      // Convert to blob
      const blob = await response.blob()
      console.log("Successfully fetched image blob:", blob.size, "bytes")
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-generated-image-${Date.now()}.png`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log("Download initiated successfully")
    } catch (error) {
      console.error("Download failed:", error)
      
      // Try alternative approach for Firebase URLs
      if (generatedImage.includes('firebasestorage.googleapis.com')) {
        console.log("Trying alternative download method for Firebase URL")
        try {
          // Open in new tab as fallback
          window.open(generatedImage, '_blank')
          alert("Download failed. Image opened in new tab - you can right-click and save it.")
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError)
          alert("Failed to download image. Please try again or contact support.")
        }
      } else {
        alert("Failed to download image. Please try again.")
      }
    }
  }

  // Auto-save project when component mounts and we have all the data
  useEffect(() => {
    const autoSaveProject = async () => {
      if (!user || !generatedImage || !prompt) return
      
      try {
        await addProject({
          name: prompt || "AI Photoshoot",
          status: "complete",
          aesthetic: "N/A",
          prompt,
          garmentImage: garmentImage || undefined,
          referenceImage: referenceImage || undefined,
          thumbnail: generatedImage || "/placeholder.svg?height=300&width=300",
          downloads: 0,
          generatedImages: [generatedImage],
        })
        console.log("Project auto-saved successfully")
      } catch (error) {
        console.error("Failed to auto-save project:", error)
      }
    }

    autoSaveProject()
  }, [user, generatedImage, prompt, garmentImage, referenceImage])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main className="container-zarta py-16">
        <div className="max-w-4xl mx-auto">
          {/* Generated Result */}
          <div className="flex flex-col items-center mb-12">
            <Label className="text-lg font-semibold text-white mb-6">Generated Result</Label>
            <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-blue-900/10">
              {isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/50">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mb-4"></div>
                  <div className="text-center">
                    <div className="text-blue-400 text-lg font-semibold mb-2">Generating...</div>
                    <div className="text-gray-400 text-sm">Creating your AI fashion photography</div>
                  </div>
                </div>
              ) : (
                <Image
                  src={generatedImage || "/placeholder.svg?height=800&width=800"}
                  alt="Your AI generated result"
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
          
          {/* Project Details */}
          <div className="space-y-8 mb-12">
            {/* AI Generated Prompt */}
            {prompt && (
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium text-white">AI Generated Prompt</Label>
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-300 leading-relaxed">{prompt}</p>
                </div>
              </div>
            )}
            
            {/* Garment and Reference Images - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Your Garment</Label>
                {garmentImage ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-800">
                    <Image
                      src={garmentImage}
                      alt="Uploaded garment"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 border border-gray-700 text-xs">
                    No garment
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Your Reference</Label>
                {referenceImage ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-800">
                    <Image
                      src={referenceImage}
                      alt="Reference style"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 border border-gray-700 text-xs">
                    No reference
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Now under project details */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold text-white mb-6">What would you like to do?</h3>
            <div className="flex flex-col gap-3 w-full max-w-md">
                              <Button
                  onClick={handleDownloadImage}
                  disabled={!generatedImage}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Download Image
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
