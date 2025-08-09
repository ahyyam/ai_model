"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import StepUploadGarment from "./step-upload-garment"
import StepUploadReference from "./step-upload-reference"
import { AnimatePresence, motion } from "framer-motion"
import StepGenerate from "./step-generate"
import ProgressIndicator from "./progress-indicator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Sparkles, HelpCircle, AlertCircle } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import VisualGuide from "./visual-guide"
import { TopNav } from "@/components/dashboard/top-nav"

export type FormData = {
  garmentImage?: File | null // Model reference image (base image for editing)
  referenceImage?: File | null // Outfit reference image
}

const steps = [
  {
    id: "garment",
    component: StepUploadGarment,
    showProgress: true,
    title: "Upload Your Garment",
    description: "Take a clear photo of the item you want to style",
  },
  {
    id: "style",
    component: StepUploadReference,
    showProgress: true,
    title: "Upload Your Reference",
    description: "Select a style reference for your AI photoshoot",
  },
  {
    id: "generate",
    component: StepGenerate,
    showProgress: true,
    title: "Generate",
    description: "Create your professional fashion photography",
  },
]

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showVisualGuide, setShowVisualGuide] = useState(false)
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null)
  const [validationError, setValidationError] = useState<string>("")
  const isMobile = useIsMobile()

  const handleNext = () => {
    setValidationError("") // Clear any previous errors
    
    if (canProceed()) {
      setIsTransitioning(true)
      setTimeout(() => {
        setStep((prev) => Math.min(prev + 1, steps.length - 1))
        setIsTransitioning(false)
      }, 150)
    } else {
      // Show validation error
      const error = getValidationError()
      setValidationError(error)
      // Clear error after 3 seconds
      setTimeout(() => setValidationError(""), 3000)
    }
  }

  const handleBack = () => {
    setValidationError("") // Clear errors when going back
    setIsTransitioning(true)
    setTimeout(() => {
      setStep((prev) => Math.max(prev - 1, 0))
      setIsTransitioning(false)
    }, 150)
  }

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
    setValidationError("") // Clear errors when data is updated
  }

  const CurrentStepComponent = steps[step].component
  const currentStepConfig = steps[step]

  // Filter steps that should show in the progress bar
  const progressSteps = steps.filter((s) => s.showProgress)
  const currentProgressIndex = progressSteps.findIndex((s) => s.id === currentStepConfig.id)

  // Check if current step can proceed
  const canProceed = () => {
    switch (step) {
      case 0: // garment upload
        return formData.garmentImage && formData.garmentImage.size > 0
      case 1: // style reference upload
        return formData.referenceImage && formData.referenceImage.size > 0
      case 2: // generate
        return formData.garmentImage && formData.referenceImage && 
               formData.garmentImage.size > 0 && formData.referenceImage.size > 0
      default:
        return false
    }
  }

  // Get specific validation error message
  const getValidationError = () => {
    switch (step) {
      case 0:
        return "Please upload a garment image to continue"
      case 1:
        return "Please upload a style reference image to continue"
      case 2:
        if (!formData.garmentImage) return "Garment image is required"
        if (!formData.referenceImage) return "Reference image is required"
        return "Both images are required to generate your AI photoshoot"
      default:
        return "Please complete the current step to continue"
    }
  }

  // Handle generation on final step
  const handleGenerate = async () => {
    if (step === steps.length - 1 && !generatedImage && !isGenerating) {
      setIsGenerating(true)
      // The actual generation logic will be handled in the StepGenerate component
      // This just triggers the generation state
    } else {
      handleNext()
    }
  }

  // Improved auto-advance logic with better timing and user control
  useEffect(() => {
    // Clear any existing timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer)
    }

    // Only auto-advance on mobile and if user hasn't manually navigated
    if (isMobile && !isTransitioning && !validationError) {
      if (step === 0 && formData.garmentImage && formData.garmentImage.size > 0) {
        const timer = setTimeout(() => {
          handleNext()
        }, 2500) // Increased delay for better UX
        setAutoAdvanceTimer(timer)
      } else if (step === 1 && formData.referenceImage && formData.referenceImage.size > 0) {
        const timer = setTimeout(() => {
          handleNext()
        }, 2500) // Increased delay for better UX
        setAutoAdvanceTimer(timer)
      }
    }

    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer)
      }
    }
  }, [formData.garmentImage, formData.referenceImage, step, isMobile, isTransitioning, validationError])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer)
      }
    }
  }, [autoAdvanceTimer])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] text-white flex flex-col z-50">
      {/* Top Navigation */}
      <TopNav />

      {/* Progress Indicator */}
      <div className="px-4 md:px-6 py-2 flex-shrink-0">
        <ProgressIndicator
          currentStep={currentProgressIndex}
          totalSteps={progressSteps.length}
          stepTitle={currentStepConfig.title}
        />
      </div>

      {/* Validation Error Banner */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 md:mx-6 mb-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2 flex-shrink-0"
          >
            <AlertCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-xs font-medium">{validationError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {step === 0 && (
              <StepUploadGarment
                formData={formData}
                updateFormData={updateFormData}
                currentStep={currentProgressIndex + 1}
                totalSteps={progressSteps.length}
                stepTitle={currentStepConfig.title}
                setShowVisualGuide={setShowVisualGuide}
              />
            )}
            {step === 1 && (
              <StepUploadReference
                formData={formData}
                updateFormData={updateFormData}
                currentStep={currentProgressIndex + 1}
                totalSteps={progressSteps.length}
                stepTitle={currentStepConfig.title}
              />
            )}
            {step === 2 && (
              <StepGenerate
                formData={formData}
                updateFormData={updateFormData}
                onBack={handleBack}
                currentStep={currentProgressIndex + 1}
                totalSteps={progressSteps.length}
                stepTitle={currentStepConfig.title}
                showProgress={currentStepConfig.showProgress}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                generatedImage={generatedImage}
                setGeneratedImage={setGeneratedImage}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="px-4 md:px-6 py-3 border-t border-gray-800 bg-gradient-to-t from-[#0a0a0a] to-transparent flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          {step > 0 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-4 sm:px-6 py-2 text-sm sm:text-base touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              Back
            </Button>
          )}
          
          {/* Empty div for spacing when back button is hidden */}
          {step === 0 && <div></div>}

          {/* Next/Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!canProceed() || isGenerating}
            className={`flex items-center gap-2 px-6 sm:px-8 py-2 text-sm sm:text-base touch-manipulation ${
              canProceed() && !isGenerating
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {step === steps.length - 1 ? (
              <>
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    Generate AI Photoshoot
                  </>
                )}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Visual Guide Modal */}
      <AnimatePresence>
        {showVisualGuide && (
          <VisualGuide onClose={() => setShowVisualGuide(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
