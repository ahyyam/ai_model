"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FileUploader from "./file-uploader"
import ProgressIndicator from "./progress-indicator"
import type { FormData } from "./onboarding-flow"
import { Check, Palette, X, Image as ImageIcon, Sparkles } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface StepUploadReferenceProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  currentStep: number
  totalSteps: number
  stepTitle: string
}

export default function StepUploadReference({
  formData,
  updateFormData,
  currentStep,
  totalSteps,
  stepTitle,
}: StepUploadReferenceProps) {
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
                file={formData.referenceImage}
                setFile={(file) => updateFormData({ referenceImage: file })}
                title="Upload Style Reference"
                description="Choose an image that shows the style you want"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
