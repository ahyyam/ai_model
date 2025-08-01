"use client"

import { useState } from "react"
import StepAesthetic from "./step-aesthetic"
import StepUploadGarment from "./step-upload-garment"
import StepUploadReference from "./step-upload-reference"
import { AnimatePresence, motion } from "framer-motion"
import StepGenerate from "./step-generate"

export type FormData = {
  aesthetic?: string
  garmentImage?: File | null
  referenceImage?: File | null
}

const steps = [
  {
    id: "aesthetic",
    component: StepAesthetic,
    showProgress: false,
    title: "Choose Aesthetic",
  },
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

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1))
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0))

  const updateFormData = (newData: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...newData }))

  const CurrentStepComponent = steps[step].component
  const currentStepConfig = steps[step]

  // Filter steps that should show in the progress bar
  const progressSteps = steps.filter((s) => s.showProgress)
  const currentProgressIndex = progressSteps.findIndex((s) => s.id === currentStepConfig.id)

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <main className="container mx-auto px-4 md:px-6 py-4">
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
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
