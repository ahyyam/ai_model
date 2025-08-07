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
import { getUserData, deductUserCredit, syncSubscriptionFromStripe, createUserData } from "@/lib/users"
import { uploadImageToStorage } from "@/lib/storage"
import { apiClient } from "@/lib/api"
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
  const [promptLoading, setPromptLoading] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()
  const [userHasCredit, setUserHasCredit] = useState<boolean | null>(null);
  const [checkingCredit, setCheckingCredit] = useState(true);

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

  // Pre-fill prompt for registered users with credits
  useEffect(() => {
    async function fetchPrompt() {
      if (!auth.currentUser || prompt) return;
      setPromptLoading(true);
      setError("");
      try {
        // Check user credits
        const userData = await getUserData(auth.currentUser.uid);
        if (!userData || (userData.credits || 0) <= 0) return;
        // Upload images to storage
        const garmentImageURL = await uploadImageToStorage(
          formData.garmentImage!,
          `temp/${auth.currentUser.uid}/garment-prompt-${Date.now()}.jpg`
        );
        const referenceImageURL = await uploadImageToStorage(
          formData.referenceImage!,
          `temp/${auth.currentUser.uid}/reference-prompt-${Date.now()}.jpg`
        );
        // Get auth token
        const token = await auth.currentUser.getIdToken();
        // Call backend to generate prompt
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            referenceImageURL,
            garmentImageURL,
            userPrompt: ""
          })
        });
        if (!response.ok) {
          throw new Error('Failed to generate prompt');
        }
        const result = await response.json();
        if (result.prompt) {
          setPrompt(result.prompt);
        }
      } catch (err) {
        setError('Could not auto-generate prompt. You can write your own.');
      } finally {
        setPromptLoading(false);
      }
    }
    if (
      formData.garmentImage &&
      formData.referenceImage &&
      !prompt &&
      auth.currentUser
    ) {
      fetchPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.garmentImage, formData.referenceImage]);

  // Check user and credit status on mount
  useEffect(() => {
    async function checkCredit() {
      setCheckingCredit(true);
      if (!auth.currentUser) {
        setUserHasCredit(false);
        setCheckingCredit(false);
        return;
      }
      try {
        const userData = await getUserData(auth.currentUser.uid);
        if (userData && (userData.credits || 0) > 0) {
          setUserHasCredit(true);
        } else {
          setUserHasCredit(false);
        }
      } catch {
        setUserHasCredit(false);
      } finally {
        setCheckingCredit(false);
      }
    }
    checkCredit();
  }, []);

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
        status: "complete" as const,
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
      let userData = await getUserData(auth.currentUser.uid)
      if (!userData) {
        // Create user data if it doesn't exist
        try {
          userData = await createUserData(auth.currentUser)
        } catch (createError) {
          console.error("Error creating user data:", createError)
          setError("Unable to create user data. Please try again.")
          return
        }
      }

      // Sync subscription status from Stripe if user has a Stripe customer ID
      let updatedUserData = userData
      if (userData.stripeCustomerId) {
        const syncedData = await syncSubscriptionFromStripe(auth.currentUser.uid)
        if (syncedData) {
          updatedUserData = syncedData
        }
      }

      // Check if user has available credits
      const availableCredits = updatedUserData.credits || 0
      if (availableCredits <= 0) {
        // No credits - redirect to subscribe page for plan selection
        router.push("/subscribe")
        return
      }

      // User has credits - proceed with generation
      console.log(`User has ${availableCredits} credits, proceeding with generation`)

      // Upload images to Firebase Storage first
      setGenerationProgress(10)
      const garmentImageURL = await uploadImageToStorage(
        formData.garmentImage!,
        `temp/${auth.currentUser.uid}/garment-${Date.now()}.jpg`
      )
      
      setGenerationProgress(20)
      const referenceImageURL = await uploadImageToStorage(
        formData.referenceImage!,
        `temp/${auth.currentUser.uid}/reference-${Date.now()}.jpg`
      )

      // Get auth token for API call
      const token = await auth.currentUser.getIdToken()
      
      setGenerationProgress(30)
      
      // Call the real generation API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          referenceImageURL,
          garmentImageURL,
          userPrompt: getValidPrompt(prompt)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      setGenerationProgress(90)
      
      const result = await response.json()
      
      if (result.success && result.finalImageURL) {
        setGeneratedImage(result.finalImageURL)
        setGenerationProgress(100)
        
        // Save project to local state for navigation
        const projectData = {
          id: result.projectId,
          name: getValidPrompt(prompt) || "AI Photoshoot",
          status: "complete" as const,
          prompt: result.prompt,
          garmentImage: garmentImageURL,
          referenceImage: referenceImageURL,
          thumbnail: result.finalImageURL,
          downloads: 0,
          generatedImages: [result.finalImageURL],
        }
        
        // Store project data for navigation
        localStorage.setItem("lastGeneratedProject", JSON.stringify(projectData))
      } else {
        throw new Error('No image URL received from generation')
      }
      
    } catch (error) {
      console.error('Error generating image:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate image. Please check your connection and try again.')
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
        status: "complete" as const,
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

  const canProceed = () => {
    return prompt.trim() !== "" && prompt.trim().length >= 3;
  };

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
                <label className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  Customize Your Prompt
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 text-xs font-medium">Optional</span>
                </label>
                {checkingCredit ? (
                  <div className="text-gray-400 text-sm py-2">Checking account status...</div>
                ) : !auth.currentUser ? (
                  <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 rounded-lg p-4 flex flex-col items-start gap-2">
                    <span>You must be logged in to generate AI photoshoots.</span>
                    <Button onClick={() => router.push('/login')} variant="secondary">Log In</Button>
                  </div>
                ) : userHasCredit === false ? (
                  <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 rounded-lg p-4 flex flex-col items-start gap-2">
                    <span>You do not have enough credits to generate an AI photoshoot.</span>
                    <Button onClick={() => router.push('/subscribe')} variant="secondary">Get Credits</Button>
                  </div>
                ) : (
                  <>
                    {promptLoading ? (
                      <div className="text-gray-400 text-sm py-2">Generating prompt...</div>
                    ) : null}
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe any specific details you'd like to see in your AI photoshoot..."
                      className="w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] px-4 py-3 sm:px-6 sm:py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-base sm:text-lg md:text-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                      disabled={promptLoading}
                    />
                  </>
                )}
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
