"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import StepUploadCombined from "./step-upload-combined"
import { AnimatePresence, motion } from "framer-motion"
import StepGenerate from "./step-generate"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Sparkles, HelpCircle } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import VisualGuide from "./visual-guide"
import { TopNav } from "@/components/dashboard/top-nav"

export type FormData = {
  garmentImage?: File | null // Model reference image (base image for editing)
  referenceImage?: File | null // Outfit reference image
}

const steps = [
  {
    id: "upload",
    component: StepUploadCombined,
    showProgress: true,
    title: "Upload Images",
    description: "Upload your garment and style reference",
  },
  {
    id: "generate",
    component: StepGenerate,
    showProgress: true,
    title: "Generate Images",
    description: "Create your AI photoshoot",
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
  const isMobile = useIsMobile()

  const handleNext = () => {
    if (canProceed()) {
      setIsTransitioning(true)
      setTimeout(() => {
        setStep((prev) => Math.min(prev + 1, steps.length - 1))
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleBack = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setStep((prev) => Math.max(prev - 1, 0))
      setIsTransitioning(false)
    }, 150)
  }

  const updateFormData = (newData: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...newData }))

  const CurrentStepComponent = steps[step].component
  const currentStepConfig = steps[step]

  // Filter steps that should show in the progress bar
  const progressSteps = steps.filter((s) => s.showProgress)
  const currentProgressIndex = progressSteps.findIndex((s) => s.id === currentStepConfig.id)

  // Check if current step can proceed
  const canProceed = () => {
    switch (step) {
      case 0: // upload (combined step)
        return formData.garmentImage && formData.referenceImage
      case 1: // generate
        return formData.garmentImage && formData.referenceImage
      default:
        return false
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
    if (isMobile && !isTransitioning) {
      if (step === 0 && formData.garmentImage && formData.referenceImage) {
        const timer = setTimeout(() => {
          handleNext()
        }, 2000) // Increased delay for better UX
        setAutoAdvanceTimer(timer)
      } else if (step === 1 && formData.garmentImage && formData.referenceImage) {
        const timer = setTimeout(() => {
          handleNext()
        }, 2000) // Increased delay for better UX
        setAutoAdvanceTimer(timer)
      }
    }

    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer)
      }
    }
  }, [formData.garmentImage, formData.referenceImage, step, isMobile, isTransitioning])

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

      {/* Main Content Area */}
      <main className="flex-1 w-full px-0 py-0 pb-14 md:pb-16 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: isMobile ? 20 : 0, y: isMobile ? 0 : 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isMobile ? -20 : 0, y: isMobile ? 0 : -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full min-h-full"
          >
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              currentStep={currentProgressIndex}
              totalSteps={progressSteps.length}
              stepTitle={currentStepConfig.title}
              showProgress={currentStepConfig.showProgress}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              generatedImage={generatedImage}
              setGeneratedImage={setGeneratedImage}
              setShowVisualGuide={setShowVisualGuide}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Enhanced Fixed Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-gray-800/50 px-4 py-3 z-50">
        <div className="container mx-auto">
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isTransitioning}
                  className="border-gray-700 text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 px-6 py-3 transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {isMobile ? "Back" : "Previous Step"}
                </Button>
              ) : (
                <div></div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canProceed() || isGenerating || isTransitioning}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {step === steps.length - 1 ? (
                isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )
              ) : (
                <>
                  {isMobile ? "Next" : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
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
