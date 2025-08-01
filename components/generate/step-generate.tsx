"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Wand2, ImageIcon } from "lucide-react"
import Image from "next/image"
import ProgressIndicator from "./progress-indicator"
import type { FormData } from "./onboarding-flow"
import { Textarea } from "@/components/ui/textarea"
import { addProject } from "@/lib/projects"
import { auth } from "@/lib/firebase"
import { getUserData, deductUserCredit } from "@/lib/users"

// Helper to convert File to Data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface StepGenerateProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  stepTitle: string
  showProgress: boolean
  isGenerating?: boolean
  setIsGenerating?: (generating: boolean) => void
  generatedImage?: string | null
  setGeneratedImage?: (image: string | null) => void
}

export default function StepGenerate({
  formData,
  updateFormData,
  currentStep,
  totalSteps,
  stepTitle,
  showProgress,
  isGenerating = false,
  setIsGenerating = () => {},
  generatedImage = null,
  setGeneratedImage = () => {},
}: StepGenerateProps) {
  const [prompt, setPrompt] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

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

  // Handle generation when triggered from parent
  useEffect(() => {
    if (isGenerating && !generatedImage) {
      handleGenerate()
    }
  }, [isGenerating])

  const deductCreditAndSaveProject = async (generatedImageUrl: string) => {
    if (!auth.currentUser) return

    try {
      // Deduct one credit from user
      const creditDeducted = await deductUserCredit(auth.currentUser.uid)
      if (!creditDeducted) {
        setError("Failed to deduct credit. Please try again.")
        return
      }

      // Save project to Firebase
      const result = await addProject({
        name: getValidPrompt(prompt) || `${formData.aesthetic} Photoshoot`,
        status: "completed",
        aesthetic: formData.aesthetic || "N/A",
        prompt: getValidPrompt(prompt),
        garmentImage: await fileToDataUrl(formData.garmentImage!),
        referenceImage: await fileToDataUrl(formData.referenceImage!),
        thumbnail: await fileToDataUrl(formData.garmentImage!),
        downloads: 0,
        generatedImages: [generatedImageUrl],
      })

      if (!result) {
        setError("Failed to save project. Please try again.")
        return
      }

      console.log("Project saved successfully and credit deducted")
    } catch (error) {
      console.error("Error saving project:", error)
      setError("Failed to save project. Please try again.")
    }
  }

  const handleGenerate = async () => {
    setGeneratedImage(null)
    setError("")
    
    try {
      // Validate required inputs following the structured flow
      if (!formData.garmentImage) {
        setError("Model reference image is required")
        return
      }
      if (!formData.referenceImage) {
        setError("Outfit reference image is required")
        return
      }
      if (!formData.aesthetic_ref) {
        setError("Aesthetic reference image is required")
        return
      }

      // Check if user is logged in
      if (!auth.currentUser) {
        // Store onboarding data for non-signed users
        const onboardingData = {
          formData,
          prompt: getValidPrompt(prompt),
          timestamp: new Date().toISOString(),
        }
        localStorage.setItem("onboardingState", JSON.stringify(onboardingData))
        
        // Redirect to login page
        router.push("/login")
        return
      }

      // User is logged in - check their credit balance
      const userData = await getUserData(auth.currentUser.uid)
      if (!userData) {
        setError("Unable to load user data. Please try again.")
        return
      }

      // Check if user has available credits
      const availableCredits = userData.credits || 0
      if (availableCredits <= 0) {
        // No credits - redirect to billing for upsell
        router.push("/billing")
        return
      }

      // User has credits - proceed with generation
      console.log(`User has ${availableCredits} credits, proceeding with generation`)

      // Convert images to base64 following the structured flow
      const model_ref = await fileToDataUrl(formData.garmentImage!) // Base image for editing
      const outfit_ref = await fileToDataUrl(formData.referenceImage!) // Outfit reference
      const aesthetic_ref = await fileToDataUrl(formData.aesthetic_ref!) // Aesthetic reference image

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
          model_ref, // Base image for editing
          outfit_ref, // Outfit reference image
          aesthetic_ref, // Aesthetic reference image
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
      setIsGenerating(false)
    }
  }

  const handleSaveAndFinish = async () => {
    setSaving(true)
    setError("")
    try {
      const garmentImage = formData.garmentImage ? await fileToDataUrl(formData.garmentImage) : undefined
      const referenceImage = formData.referenceImage ? await fileToDataUrl(formData.referenceImage) : undefined

      // Check if user is logged in
      if (!auth.currentUser) {
        // Store onboarding state in localStorage
        localStorage.setItem("onboardingState", JSON.stringify({
          formData,
          prompt,
          garmentImage,
          referenceImage,
          generatedImage,
        }))
        router.push("/login")
        setSaving(false)
        return
      }

      // Placeholder: Check if user is premium
      const isPremium = true // TODO: Replace with real premium check
      if (!isPremium) {
        setError("You must be a premium user to generate results. Please upgrade your plan.")
        setSaving(false)
        return
      }

      // Only generate for premium users
      const result = await addProject({
        name: prompt || `${formData.aesthetic} Photoshoot`,
        status: "completed",
        aesthetic: formData.aesthetic || "N/A",
        prompt,
        garmentImage,
        referenceImage,
        thumbnail: garmentImage || "/placeholder.svg?height=300&width=300",
        downloads: 0,
        generatedImages: [generatedImage || referenceImage || "/placeholder.svg?height=400&width=400"],
      })

      if (result) {
        router.push("/projects")
      } else {
        setError("Failed to save project. Please log in.")
      }
    } catch (e) {
      setError("An error occurred while saving the project.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Progress and Header */}
      <div className="mb-6">
        <div className="mb-4">
          {showProgress && (
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} stepTitle={stepTitle} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left Column: Placeholder/Loading/Result */}
        <div className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-900/30 p-2">
          {isGenerating ? (
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-pulse" />
              <h3 className="font-sora text-lg font-semibold text-white">Generating your visuals...</h3>
              <p className="text-gray-400">This may take a moment.</p>
            </div>
          ) : generatedImage ? (
            <Image
              src={generatedImage || "/placeholder.svg"}
              alt="Generated AI Photoshoot"
              width={800}
              height={800}
              className="w-full h-full object-contain rounded-md"
            />
          ) : (
            <div className="text-center p-8">
              <ImageIcon className="h-14 w-14 text-gray-400 mb-4 mx-auto" />
              <h3 className="font-sora text-lg font-semibold text-white mb-2">Your result will appear here</h3>
              <p className="text-gray-400">Customize your prompt and use the Generate button below.</p>
            </div>
          )}
        </div>

        {/* Right Column: Inputs and Actions */}
        <Card className="bg-gradient-to-br from-[#1c1c1c] to-[#171717] border-gray-700/50 text-white shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-sora text-lg flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <Wand2 className="h-4 w-4 text-blue-400" />
              </div>
              Finalize & Generate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {/* Input Images - Horizontal Layout */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-800 mb-2">
                  {formData.garmentImage ? (
                    <Image
                      src={URL.createObjectURL(formData.garmentImage) || "/placeholder.svg"}
                      alt="Your garment"
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-300 font-medium">Your Garment</p>
              </div>
              <div className="text-center">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-800 mb-2">
                  {formData.referenceImage ? (
                    <Image
                      src={URL.createObjectURL(formData.referenceImage) || "/placeholder.svg"}
                      alt="Reference style"
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-300 font-medium">Reference Image</p>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-medium">
                Describe your vision <span className="text-gray-400">(Optional)</span>
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'On a model in Paris near the Eiffel tower...'"
                className="bg-gray-800/50 border-gray-700 text-white min-h-[80px] text-sm"
                disabled={!!generatedImage}
              />
            </div>

            {/* Save Button (only shown after generation) */}
            {generatedImage && (
              <Button
                onClick={handleSaveAndFinish}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-base"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            )}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
