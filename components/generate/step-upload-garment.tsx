"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import FileUploader from "./file-uploader"
import ProgressIndicator from "./progress-indicator"
import type { FormData } from "./onboarding-flow"
import { Check, Lightbulb, X, Camera, Sparkles, HelpCircle } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface StepUploadGarmentProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  currentStep: number
  totalSteps: number
  stepTitle: string
  setShowVisualGuide?: (show: boolean) => void
}

export default function StepUploadGarment({
  formData,
  updateFormData,
  currentStep,
  totalSteps,
  stepTitle,
  setShowVisualGuide,
}: StepUploadGarmentProps) {
  const isMobile = useIsMobile()

  return (
    <div className="w-full h-full flex flex-col">
      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 pb-6 sm:pb-8">
        <div className="container-xl mx-auto h-full">
          <div className="max-w-4xl mx-auto flex justify-center items-center h-full">
            {/* File Uploader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <FileUploader
                file={formData.garmentImage}
                setFile={(file) => updateFormData({ garmentImage: file })}
                title="Upload Your Garment"
                description="Take a clear photo of the item you want to style"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
