"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Wand2, ImageIcon, Download, Share2, RefreshCw, Loader2, Maximize2, Lightbulb, AlertCircle, CheckCircle } from "lucide-react"
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
  const [validationErrors, setValidationErrors] = useState<string[]>([])
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

  // Validate form data
  const validateFormData = (): boolean => {
    const errors: string[] = []
    
    if (!formData.garmentImage) {
      errors.push("Garment image is required")
    } else if (formData.garmentImage.size === 0) {
      errors.push("Garment image file is empty")
    }
    
    if (!formData.referenceImage) {
      errors.push("Reference image is required")
    } else if (formData.referenceImage.size === 0) {
      errors.push("Reference image file is empty")
    }
    
    setValidationErrors(errors)
    return errors.length === 0
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
    setValidationErrors([])
    setGenerationProgress(0)
    
    // Validate form data first
    if (!validateFormData()) {
      return
    }
    
    try {
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
        // No credits - redirect to subscribe page for plan selection
        router.push("/subscribe")
        return
      }

      // User has credits - proceed with generation
      console.log(`User has ${availableCredits} credits, proceeding with generation`)

      // Simulate image generation process
      setGenerationProgress(25)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setGenerationProgress(50)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setGenerationProgress(75)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For now, use the reference image as the "generated" image
      // In a real implementation, this would be replaced with actual AI image generation
      const generatedImageUrl = await fileToDataUrl(formData.referenceImage!)
      setGeneratedImage(generatedImageUrl)
      setGenerationProgress(100)

      // Deduct credit and save project to Firebase
      await deductCreditAndSaveProject(generatedImageUrl)
      
    } catch (error) {
      console.error('Error generating image:', error)
      setError('Failed to generate image. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveAndFinish = async () => {
    setSaving(true)
    setError("")
    setValidationErrors([])
    
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

      // Check if user has available credits
      const userData = await getUserData(auth.currentUser.uid)
      if (!userData) {
        setError("Unable to load user data. Please try again.")
        setSaving(false)
        return
      }

      const availableCredits = userData.credits || 0
      if (availableCredits <= 0) {
        // No credits - redirect to subscribe page for plan selection
        router.push("/subscribe")
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
      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 pb-6 sm:pb-8 flex items-center justify-center">
        <div className="container-lg mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column: Uploaded Images Side by Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Images Side by Side */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {/* Garment Image */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-lg sm:text-xl font-bold text-white">Your Garment</label>
                  <div className="aspect-[4/3] rounded-lg border-2 border-gray-600 bg-gray-800/30 flex items-center justify-center overflow-hidden">
                    {formData.garmentImage ? (
                      <img
                        src={URL.createObjectURL(formData.garmentImage)}
                        alt="Uploaded Garment"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <p className="text-sm">No garment uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reference Image */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-lg sm:text-xl font-bold text-white">Your Reference</label>
                  <div className="aspect-[4/3] rounded-lg border-2 border-gray-600 bg-gray-800/30 flex items-center justify-center overflow-hidden">
                    {formData.referenceImage ? (
                      <img
                        src={URL.createObjectURL(formData.referenceImage)}
                        alt="Uploaded Reference"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <p className="text-sm">No reference uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              <AnimatePresence>
                {validationErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 text-sm font-medium mb-1">Please fix the following issues:</p>
                        <ul className="text-red-300 text-sm space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-300 rounded-full"></span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right Column: Prompt Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Prompt Input */}
              <div className="space-y-3 sm:space-y-4">
                <label className="text-lg sm:text-xl font-bold text-white">Customize Your Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe any specific details you'd like to see in your AI photoshoot..."
                  className="w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] px-4 py-3 sm:px-6 sm:py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-base sm:text-lg md:text-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                />
                <p className="text-sm sm:text-base text-gray-500">Add specific details like poses, expressions, or style preferences</p>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
