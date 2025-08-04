"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Lock, Sparkles, Star } from "lucide-react"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { addProject } from "@/lib/projects"
import { getUserData, deductUserCredit } from "@/lib/users"

const trustedBrands = [
  { name: "BrandA", logo: "/placeholder.svg?height=40&width=100&text=BrandA" },
  { name: "BrandB", logo: "/placeholder.svg?height=40&width=100&text=BrandB" },
  { name: "BrandC", logo: "/placeholder.svg?height=40&width=100&text=BrandC" },
  { name: "BrandD", logo: "/placeholder.svg?height=40&width=100&text=BrandD" },
]

export default function ResultsPage() {
  const router = useRouter()
  const [garmentImage, setGarmentImage] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  // Helper function to clean and validate prompt
  const getValidPrompt = (userPrompt: string): string => {
    const trimmedPrompt = userPrompt.trim()
    
    // If prompt is empty or only whitespace, use default
    if (!trimmedPrompt) {
      return "Professional product photo with outfit styling"
    }
    
    // If prompt is too short (less than 3 characters), use default
    if (trimmedPrompt.length < 3) {
      return "Professional product photo with outfit styling"
    }
    
    // Return the cleaned prompt
    return trimmedPrompt
  }

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
    // Try to get onboarding state from localStorage
    const onboardingState = localStorage.getItem("onboardingState")
    if (onboardingState) {
      const data = JSON.parse(onboardingState)
      setGarmentImage(data.garmentImage || null)
      setReferenceImage(data.referenceImage || null)
      setPrompt(data.prompt || "")
      setGeneratedImage(data.generatedImage || null)
    }
    // Optionally, fetch last project for logged-in users if needed
  }, [])

  const deductCreditAndSaveProject = async (generatedImageUrl: string) => {
    if (!user) return

    try {
      // Deduct one credit from user
      const creditDeducted = await deductUserCredit(user.uid)
      if (!creditDeducted) {
        setError("Failed to deduct credit. Please try again.")
        return
      }

      // Get onboarding data for project details
      const onboardingState = localStorage.getItem("onboardingState")
      if (!onboardingState) {
        setError("No onboarding data found. Please try again.")
        return
      }

      const onboardingData = JSON.parse(onboardingState)

      // Save project to Firebase
      const result = await addProject({
        name: getValidPrompt(prompt) || `${onboardingData.formData.aesthetic} Photoshoot`,
        status: "completed",
        aesthetic: onboardingData.formData.aesthetic || "N/A",
        prompt: getValidPrompt(prompt),
        garmentImage: onboardingData.formData.garmentImage,
        referenceImage: onboardingData.formData.referenceImage,
        thumbnail: onboardingData.formData.garmentImage,
        downloads: 0,
        generatedImages: [generatedImageUrl],
      })

      if (!result) {
        setError("Failed to save project. Please try again.")
        return
      }

      console.log("Project saved successfully and credit deducted")
      
      // Clear onboarding state after successful save
      localStorage.removeItem("onboardingState")
    } catch (error) {
      console.error("Error saving project:", error)
      setError("Failed to save project. Please try again.")
    }
  }

  const handleEditPrompt = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError("")
    
    try {
      // Check user's credit balance
      const userData = await getUserData(user.uid)
      if (!userData) {
        setError("Unable to load user data. Please try again.")
        return
      }

      const availableCredits = userData.credits || 0
      if (availableCredits <= 0) {
        // No credits - redirect to subscribe page for plan selection
        router.push("/subscribe")
        return
      }

      // User has credits - proceed with generation
      console.log(`User has ${availableCredits} credits, proceeding with regeneration`)

      // Get onboarding data
      const onboardingState = localStorage.getItem("onboardingState")
      if (!onboardingState) {
        setError("No onboarding data found. Please start over.")
        return
      }

      const onboardingData = JSON.parse(onboardingState)
      
      // Get validated prompt (handles empty strings, whitespace, etc.)
      const validatedPrompt = getValidPrompt(prompt)

      // Call the OpenAI API with structured flow
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: validatedPrompt,
          model_ref: onboardingData.formData.garmentImage,
          outfit_ref: onboardingData.formData.referenceImage,
          aesthetic_ref: onboardingData.formData.aesthetic_ref,
          size: '1024x1024',
        }),
      })

      const data = await response.json()

      if (data.success && data.images && data.images.length > 0) {
        const generatedImageUrl = data.images[0]
        setGeneratedImage(generatedImageUrl)

        // Deduct credit and save project to Firebase
        await deductCreditAndSaveProject(generatedImageUrl)
      } else {
        setError(data.error || 'Failed to generate image')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setError('Failed to generate image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProject = async () => {
    if (!user) return
    await addProject({
      name: prompt || "AI Photoshoot",
      status: "completed",
      aesthetic: "N/A",
      prompt,
      garmentImage: garmentImage || undefined,
      referenceImage: referenceImage || undefined,
      thumbnail: garmentImage || "/placeholder.svg?height=300&width=300",
      downloads: 0,
      generatedImages: [generatedImage || referenceImage || "/placeholder.svg?height=400&width=400"],
    })
    router.push("/projects")
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Left Column: Visual Result & Proof */}
          <div className="space-y-8 lg:sticky lg:top-8">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-blue-900/10">
              <Image
                src={generatedImage || "/placeholder.svg?height=800&width=800"}
                alt="Your AI generated result"
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-400 ml-1">Your Garment</Label>
                {garmentImage ? (
                  <Image
                    src={garmentImage}
                    alt="Uploaded garment"
                    width={300}
                    height={300}
                    className="rounded-lg object-cover aspect-square border border-gray-800"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">No garment image</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400 ml-1">Your Reference</Label>
                {referenceImage ? (
                  <Image
                    src={referenceImage}
                    alt="Reference style"
                    width={300}
                    height={300}
                    className="rounded-lg object-cover aspect-square border border-gray-800"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">No reference image</div>
                )}
              </div>
            </div>
          </div>
          {/* Right Column: Prompt Editing & Actions */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
            <Card className="bg-[#1c1c1c] border-gray-800 text-white rounded-2xl">
              <CardHeader>
                <CardTitle className="font-sora text-3xl font-bold">Edit Prompt & Regenerate</CardTitle>
                <p className="text-gray-400 pt-1">Change your prompt and generate a new result.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Label htmlFor="prompt">Prompt</Label>
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 h-12"
                  placeholder="Describe your desired style..."
                />
                {error && (
                  <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleEditPrompt}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
                  >
                    {isLoading ? "Generating..." : "Regenerate"}
                  </Button>
                  <Button
                    onClick={handleSaveProject}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-base"
                  >
                    Save
                  </Button>
                </div>
                <Button
                  onClick={() => router.push("/projects")}
                  variant="outline"
                  className="w-full mt-2 border-blue-600 text-blue-400 hover:bg-blue-900/10"
                >
                  Go to Projects
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
