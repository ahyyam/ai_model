"use client"

import { useState } from "react"
import StepUploadGarment from "./step-upload-garment"
import StepUploadReference from "./step-upload-reference"
import { AnimatePresence, motion } from "framer-motion"
import StepGenerate from "./step-generate"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export type FormData = {
  garmentImage?: File | null // Model reference image (base image for editing)
  referenceImage?: File | null // Outfit reference image
}

const steps = [
  {
    id: "garment",
    component: StepUploadGarment,
    showProgress: true,
    title: "Upload Garment",
  },
  {
    id: "reference",
    component: StepUploadReference,
    showProgress: true,
    title: "Add Reference",
  },
  {
    id: "generate",
    component: StepGenerate,
    showProgress: true,
    title: "Generate Images",
  },
]

export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1))
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0))

  const updateFormData = (newData: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...newData }))

  const CurrentStepComponent = steps[step].component
  const currentStepConfig = steps[step]

  // Filter steps that should show in the progress bar
  const progressSteps = steps.filter((s) => s.showProgress)
  const currentProgressIndex = progressSteps.findIndex((s) => s.id === currentStepConfig.id)

  // Check if current step can proceed
  const canProceed = () => {
    switch (step) {
      case 0: // garment
        return formData.garmentImage
      case 1: // reference
        return formData.referenceImage
      case 2: // generate
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

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-4 sm:py-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
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
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed Navigation Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-gray-800 px-4 py-4 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {step > 0 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800 px-6 py-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div></div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!canProceed() || isGenerating}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === steps.length - 1 ? (isGenerating ? "Generating..." : "Generate") : "Next"}
            {step !== steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
