"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FileUploader from "./file-uploader"
import ProgressIndicator from "./progress-indicator"
import type { FormData } from "./onboarding-flow"
import { Check, Palette, X } from "lucide-react"
import Image from "next/image"

interface StepUploadReferenceProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  stepTitle: string
  showProgress: boolean
}

export default function StepUploadReference({
  formData,
  updateFormData,
  currentStep,
  totalSteps,
  stepTitle,
  showProgress,
}: StepUploadReferenceProps) {
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Progress and Header */}
      <div className="mb-6">
        <div className="mb-4">
          {showProgress && (
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} stepTitle={stepTitle} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left Column - File Uploader */}
        <div className="space-y-4">
          <FileUploader
            file={formData.referenceImage}
            setFile={(file) => updateFormData({ referenceImage: file })}
            title="Upload a Reference Image"
          />
        </div>

        {/* Right Column - Redesigned Guidelines Container */}
        <Card className="bg-gradient-to-br from-[#1c1c1c] to-[#171717] border-gray-700/50 text-white shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-sora text-lg flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <Palette className="h-4 w-4 text-blue-400" />
              </div>
              Style Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-green-400 flex-shrink-0" />
                  <span>Professional photography</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-green-400 flex-shrink-0" />
                  <span>Clear mood & atmosphere</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                  <span>Busy or cluttered scenes</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                  <span>Screenshots or collages</span>
                </li>
              </ul>
            </div>

            {/* Compact Good vs Bad Examples */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="relative mb-2">
                  <Image
                    src="/placeholder.svg?height=120&width=120"
                    alt="Good reference example"
                    width={120}
                    height={120}
                    className="rounded-lg object-cover w-full aspect-square border-2 border-green-500/30"
                  />
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-xs text-green-400 font-medium">Good</p>
              </div>
              <div className="text-center">
                <div className="relative mb-2">
                  <Image
                    src="/placeholder.svg?height=120&width=120"
                    alt="Bad reference example"
                    width={120}
                    height={120}
                    className="rounded-lg object-cover w-full aspect-square border-2 border-red-500/30"
                  />
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                    <X className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-xs text-red-400 font-medium">Avoid</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                <strong>Pro Tip:</strong> High-quality fashion editorials or lookbook images work best as references.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
