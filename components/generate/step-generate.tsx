"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { FormData } from "./onboarding-flow"
import { addProject } from "@/lib/projects"
import { auth } from "@/lib/firebase"
import { getUserData, syncSubscriptionFromStripe, createUserData } from "@/lib/users"
import { uploadImageToStorage } from "@/lib/storage"
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
  const [aiPromptReady, setAiPromptReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [generationProgress, setGenerationProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [promptLoading, setPromptLoading] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()
  const [userHasCredit, setUserHasCredit] = useState<boolean | null>(null);
  const [checkingCredit, setCheckingCredit] = useState(true);
  const isLoggedIn = !!auth?.currentUser;

  // Helper function to clean and validate prompt
  const getValidPrompt = (userPrompt: string): string => {
    const trimmed = (userPrompt || "").trim()
    let value = trimmed.length >= 3 ? trimmed : "Detailed fashion photography featuring the uploaded garment styled on a model, matching the reference image pose and lighting, high-quality studio photography with clean background, detailed fabric texture and color accuracy"
    if (value.length > 1000) value = value.slice(0, 1000) // Enforce <= 1000 UTF-16 code units
    return value
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
        setGenerationProgress((prev: number) => {
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
      const user = auth?.currentUser;
      if (!user || prompt) return;
      setPromptLoading(true);
      setError("");
      try {
        // Check user credits
        const userData = await getUserData(user.uid);
        if (!userData || (userData.credits || 0) < 0.5) {
          console.log("No credits available for prompt generation");
          return;
        }
        
        console.log("Starting prompt generation for user:", user.uid);
        
        // Upload images to storage
        console.log("Uploading garment image to Firebase Storage...");
        const garmentImageURL = await uploadImageToStorage(
          formData.garmentImage!,
          `temp/${user.uid}/garment-prompt-${Date.now()}.jpg`
        );
        console.log("Garment image uploaded successfully:", garmentImageURL);
        
        console.log("Uploading reference image to Firebase Storage...");
        const referenceImageURL = await uploadImageToStorage(
          formData.referenceImage!,
          `temp/${user.uid}/reference-prompt-${Date.now()}.jpg`
        );
        console.log("Reference image uploaded successfully:", referenceImageURL);
        
        console.log("Both images uploaded successfully:", { garmentImageURL, referenceImageURL });
        
        // Get auth token with force refresh to ensure it's valid
        const token = await user.getIdToken(true);
        console.log("Got auth token for prompt generation");
        
        // Call backend to generate prompt
        const response = await fetch('/api/generate-prompt', {
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
        
        console.log("Prompt generation response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Prompt generation failed:", errorText);
          
          // Check if it's an authentication error
          if (response.status === 401) {
            throw new Error('Authentication error - token may be expired');
          }
          
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log("Prompt generation result:", result);
        
        if (result.prompt) {
          setPrompt(result.prompt);
          setAiPromptReady(true);
          console.log("Prompt set successfully:", result.prompt);
        } else {
          throw new Error("No prompt returned from server");
        }
      } catch (err) {
        console.error("Prompt generation error:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        if (errorMessage.includes('credits') || errorMessage.includes('credit')) {
          setError('Insufficient credits for auto-prompt generation. You can write your own prompt.');
        } else if (errorMessage.includes('auth') || errorMessage.includes('token') || errorMessage.includes('Authentication error')) {
          setError('Authentication error. Please refresh the page and try again.');
        } else if (errorMessage.includes('upload') || errorMessage.includes('storage') || errorMessage.includes('Failed to fetch image')) {
          setError('Image upload failed. Please try again.');
        } else if (errorMessage.includes('Failed to generate prompt')) {
          setError('AI prompt generation failed. You can write your own prompt.');
        } else {
          setError(`Could not auto-generate prompt: ${errorMessage}. You can write your own prompt.`);
        }
      } finally {
        setPromptLoading(false);
      }
    }
    
    // Only fetch prompt if we have both images, no existing prompt, and user is authenticated with credits
    if (
      formData.garmentImage &&
      formData.referenceImage &&
      !prompt &&
      isLoggedIn
    ) {
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        fetchPrompt();
      }, 500);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.garmentImage, formData.referenceImage]);

  // Check user and credit status on mount
  useEffect(() => {
    async function checkCredit() {
      setCheckingCredit(true);
      const user = auth?.currentUser;
      if (!user) {
        setUserHasCredit(false);
        setCheckingCredit(false);
        return;
      }
      try {
        const userData = await getUserData(user.uid);
        if (userData && (userData.credits || 0) >= 0.5) {
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

  // removed unused deductCreditAndSaveProject

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
      const user = auth?.currentUser;
      if (!user) {
        // Store onboarding data for non-signed users
        const onboardingData = {
          formData,
          prompt: getValidPrompt(prompt),
          timestamp: new Date().toISOString(),
        }
        localStorage.setItem("onboardingState", JSON.stringify(onboardingData))
        
        // Redirect to sign in page
        router.push("/signup")
        return
      }

      // Ensure user is properly authenticated
      try {
        await user.getIdToken(true) // Force refresh the token
      } catch (error) {
        console.error("Token refresh failed:", error)
        setError("Authentication failed. Please sign in again.")
        router.push("/login")
        return
      }

      // User is logged in - check their credit balance
      let userData = await getUserData(user.uid)
      if (!userData) {
        // Create user data if it doesn't exist
        try {
          userData = await createUserData(user)
        } catch (createError) {
          console.error("Error creating user data:", createError)
          setError("Unable to create user data. Please try again.")
          return
        }
      }

      // Sync subscription status from Stripe if user has a Stripe customer ID
      let updatedUserData = userData
      if (userData.stripeCustomerId) {
        const syncedData = await syncSubscriptionFromStripe(user.uid)
        if (syncedData) {
          updatedUserData = syncedData
        }
      }

      // Check if user has available credits
      const availableCredits = updatedUserData.credits || 0
      if (availableCredits < 0.5) {
        // No credits - redirect to subscribe page for plan selection
        router.push("/subscribe")
        return
      }

      // User has credits - proceed with generation
      console.log(`User has ${availableCredits} credits, proceeding with generation`)

      // Upload images to Firebase Storage first
      setGenerationProgress(10)
      console.log("Uploading garment image...")
      const garmentImageURL = await uploadImageToStorage(
        formData.garmentImage!,
        `temp/${user.uid}/garment-${Date.now()}.jpg`
      )
      console.log("Garment image uploaded:", garmentImageURL)
      
      setGenerationProgress(20)
      console.log("Uploading reference image...")
      const referenceImageURL = await uploadImageToStorage(
        formData.referenceImage!,
        `temp/${user.uid}/reference-${Date.now()}.jpg`
      )
      console.log("Reference image uploaded:", referenceImageURL)

      // Get auth token for API call
      const token = await user.getIdToken()
      console.log("User authenticated:", !!user)
      console.log("Token obtained:", !!token)
      
      // Verify token is valid
      if (!token) {
        throw new Error("Authentication failed. Please sign in again.")
      }
      
      setGenerationProgress(30)
      console.log("Starting image generation...")
      
      // Call the generation API (async)
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
        console.error('API Response status:', response.status)
        console.error('API Response headers:', Object.fromEntries(response.headers.entries()))
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Generation API error:', errorData)
        
        // Provide more specific error messages
        let errorMessage = errorData.error || 'Failed to generate image'
        
        if (errorMessage.includes('Runway API key')) {
          errorMessage = 'AI service configuration error. Please contact support.'
        } else if (errorMessage.includes('Network error')) {
          errorMessage = 'Network connection issue. Please check your internet and try again.'
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Generation took too long. Please try again.'
        } else if (errorMessage.includes('credits')) {
          errorMessage = 'Insufficient credits. Please purchase more credits to continue.'
        }
        
        throw new Error(errorMessage)
      }

      const started = await response.json()
      if (!started?.started || !started?.projectId) {
        throw new Error('Failed to start generation')
      }

      setGenerationProgress(60)

      // Poll status endpoint until complete
      const pollStart = Date.now()
      const pollTimeoutMs = 1000 * 60 * 4 // 4 minutes
      let finalUrl: string | null = null
      while (Date.now() - pollStart < pollTimeoutMs) {
        await new Promise(r => setTimeout(r, 2000))
        const statusRes = await fetch('/api/generate/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ projectId: started.projectId })
        })
        if (!statusRes.ok) {
          let message = `Status check failed (${statusRes.status})`
          try {
            const err = await statusRes.json()
            if (err?.error) message = err.error
          } catch {}
          throw new Error(message)
        }
        const statusData = await statusRes.json()
        if (statusData.status === 'error') {
          throw new Error(statusData.error || 'Generation failed. Please try again.')
        }
        if (statusData.status === 'complete' && statusData.finalImageURL) {
          finalUrl = statusData.finalImageURL
          break
        }
        setGenerationProgress((p) => Math.min(95, p + 2))
      }

      if (!finalUrl) {
        throw new Error('Generation still processing. Please check your projects later.')
      }

      setGeneratedImage(finalUrl)
      setGenerationProgress(100)
      // Persist onboarding state for results page and navigate
      try {
        const garmentImageDataUrl = await fileToDataUrl(formData.garmentImage!)
        const referenceImageDataUrl = await fileToDataUrl(formData.referenceImage!)
        localStorage.setItem("onboardingState", JSON.stringify({
          garmentImage: garmentImageDataUrl,
          referenceImage: referenceImageDataUrl,
          prompt: getValidPrompt(prompt),
          generatedImage: finalUrl
        }))
      } catch (e) {
        console.warn('Failed to persist onboarding state:', e)
      }
      router.push('/generate/results')
      // Store minimal project data for navigation
      localStorage.setItem("lastGeneratedProject", JSON.stringify({
        id: started.projectId,
        name: getValidPrompt(prompt) || 'AI Photo Shoot',
        status: 'complete',
        prompt: started.prompt,
        garmentImage: garmentImageURL,
        referenceImage: referenceImageURL,
        thumbnail: finalUrl,
        downloads: 0,
        generatedImages: [finalUrl]
      }))
      
    } catch (error) {
      console.error('Error generating image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image. Please check your connection and try again.'
      setError(errorMessage)
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
      const user = auth?.currentUser;
      if (!user) {
        // Store onboarding state in localStorage
        localStorage.setItem("onboardingState", JSON.stringify({
          formData,
          prompt,
          garmentImage,
          referenceImage,
          generatedImage,
        }))
        router.push("/signup")
        setSaving(false)
        return
      }

      // Check if user has available credits
      const userData = await getUserData(user.uid)
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
        name: prompt || "AI Photo Shoot",
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
                          {validationErrors.map((error: string, index: number) => (
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
                ) : !isLoggedIn ? (
                  <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 rounded-lg p-4 flex flex-col items-start gap-2">
                    <span>You must be signed up to generate AI photo shoots.</span>
                    <Button onClick={() => router.push('/signup')} variant="secondary">Sign Up</Button>
                  </div>
                ) : userHasCredit === false ? (
                  <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 rounded-lg p-4 flex flex-col items-start gap-2">
                    <span>You do not have enough credits to generate an AI photo shoot.</span>
                    <Button onClick={() => router.push('/subscribe')} variant="secondary">Get Credits</Button>
                  </div>
                ) : (
                  <>
                    {promptLoading ? (
                      <div className="text-gray-400 text-sm py-2">Generating prompt...</div>
                    ) : null}
                    <textarea
                      value={prompt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value.slice(0, 1000))}
                      placeholder="AI-generated prompt will appear here. You can edit after it loads."
                      className="w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] px-4 py-3 sm:px-6 sm:py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-base sm:text-lg md:text-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                      disabled={!aiPromptReady || promptLoading}
                      maxLength={1000}
                    />
                    <div className="text-xs text-gray-400 text-right">{prompt.length}/1000</div>
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
