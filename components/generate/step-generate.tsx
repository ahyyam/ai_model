"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Wand2, ImageIcon, Download, Share2, RefreshCw, Loader2, Maximize2, Lightbulb } from "lucide-react"
import Image from "next/image"
import ProgressIndicator from "./progress-indicator"
import type { FormData } from "./onboarding-flow"
import { Textarea } from "@/components/ui/textarea"
import { addProject } from "@/lib/projects"
import { auth } from "@/lib/firebase"
import { getUserData, deductUserCredit } from "@/lib/users"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

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
  const [generationProgress, setGenerationProgress] = useState(0)
  const router = useRouter()
  const isMobile = useIsMobile()

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

  // Simulate generation progress
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)
      return () => clearInterval(interval)
    } else {
      setGenerationProgress(0)
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
        name: getValidPrompt(prompt) || "AI Photoshoot",
        status: "completed",
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
    setGenerationProgress(0)
    
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
          size: '1024x1024',
        }),
      })

      const data = await response.json()

      if (data.success && data.images && data.images.length > 0) {
        const generatedImageUrl = data.images[0]
        setGeneratedImage(generatedImageUrl)
        setGenerationProgress(100)

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
        name: prompt || "AI Photoshoot",
        status: "completed",
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
    <div className="w-full min-h-full flex flex-col py-2 md:py-4">
      {/* Header */}
      <div className="px-4 md:px-6 mb-4 flex flex-col items-start">
        <h2 className="text-lg md:text-xl font-sora font-semibold text-white">Generate Your AI Photoshoot</h2>
        <p className="text-gray-400 text-sm">Review and customize your AI fashion photoshoot</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Left Column: Result Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-start justify-start space-y-2"
            >
              <div className="w-full max-w-sm aspect-[4/3] rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-900/30 p-2 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-3"
                    >
                      <div className="relative mb-2">
                        <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-blue-400 mx-auto animate-pulse" />
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
                      </div>
                      <h3 className="font-sora text-xs md:text-sm font-semibold text-white mb-1">Creating your AI photoshoot...</h3>
                      <p className="text-gray-400 text-xs mb-2">This may take 30-60 seconds</p>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                        <motion.div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${generationProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{Math.round(generationProgress)}% complete</p>
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full relative"
                    >
                      <Image
                        src={generatedImage}
                        alt="Generated AI Fashion Photo"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-3"
                    >
                      <ImageIcon className="h-6 w-6 md:h-8 md:w-8 text-gray-500 mx-auto mb-2" />
                      <h3 className="text-xs md:text-sm font-semibold text-white mb-1">Your AI Photoshoot</h3>
                      <p className="text-gray-400 text-xs">Generated image will appear here</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              {generatedImage && (
                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
                  <Button
                    onClick={handleSaveAndFinish}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save & Finish'}
                  </Button>
                  <Button
                    onClick={() => window.open(generatedImage, '_blank')}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-4 py-2 text-sm"
                  >
                    <Share2 className="h-4 w-4" />
                    View Full Size
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Right Column: Customization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Customize Your Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe any specific details you'd like to see in your AI photoshoot..."
                  className="w-full min-h-[80px] md:min-h-[100px] px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">Add specific details like poses, expressions, or style preferences</p>
              </div>

              {/* Tips Card */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-white">Pro Tips</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Be specific about poses and expressions</li>
                      <li>• Mention lighting preferences (natural, studio, dramatic)</li>
                      <li>• Include style details (casual, formal, artistic)</li>
                      <li>• Specify background preferences if desired</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
