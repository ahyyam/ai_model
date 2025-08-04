"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Check, X, Sparkles, Palette, Image as ImageIcon, HelpCircle } from "lucide-react"
import FileUploader from "./file-uploader"
import { FormData } from "./onboarding-flow"

interface StepUploadCombinedProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext?: () => void
  onBack?: () => void
  currentStep?: number
  totalSteps?: number
  stepTitle?: string
  showProgress?: boolean
  isGenerating?: boolean
  setIsGenerating?: (generating: boolean) => void
  generatedImage?: string | null
  setGeneratedImage?: (image: string | null) => void
  setShowVisualGuide?: (show: boolean) => void
}

export default function StepUploadCombined({ formData, updateFormData, setShowVisualGuide }: StepUploadCombinedProps) {
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)

  const handleGarmentUpload = (file: File | null) => {
    updateFormData({ garmentImage: file })
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setGarmentPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setGarmentPreview(null)
    }
  }

  const handleReferenceUpload = (file: File | null) => {
    updateFormData({ referenceImage: file })
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setReferencePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setReferencePreview(null)
    }
  }

  return (
    <div className="w-full min-h-full flex flex-col py-4 md:py-6">
      {/* Header Section */}
      <div className="flex-shrink-0 mb-4 px-4">
        <h2 className="text-lg md:text-xl font-bold text-white mb-2 text-center">Upload Your Images</h2>
        <p className="text-gray-400 text-sm text-center max-w-2xl mx-auto px-2">
          Upload your garment photo and choose a style reference to create stunning AI fashion photography
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column - Garment Upload */}
            <div className="flex flex-col justify-center space-y-4 md:space-y-6">
              <div className="text-center">
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">1. Upload Garment Photo</h3>
                <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6 px-2">Upload a clear photo of your clothing item on a plain background</p>
                
                <div className="flex justify-center">
                  <div className="w-full max-w-sm md:max-w-md">
                    <FileUploader
                      file={formData.garmentImage}
                      setFile={handleGarmentUpload}
                      title="Garment Photo"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Reference Upload */}
            <div className="flex flex-col justify-center space-y-4 md:space-y-6">
              <div className="text-center">
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">2. Choose Style Reference</h3>
                <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6 px-2">Select a style reference image to define the aesthetic</p>
                
                <div className="flex justify-center">
                  <div className="w-full max-w-sm md:max-w-md">
                    <FileUploader
                      file={formData.referenceImage}
                      setFile={handleReferenceUpload}
                      title="Style Reference"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <Card className="mt-6 md:mt-8 bg-blue-500/10 border-blue-500/20 max-w-3xl mx-auto">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm md:text-base font-medium text-white mb-1 md:mb-2">Pro Tip</p>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                    For best results, use high-quality images with good lighting. The AI will combine your garment photo 
                    with the style reference to create professional fashion photography.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Need Help Button */}
          {setShowVisualGuide && (
            <div className="mt-4 md:mt-6 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVisualGuide(true)}
                className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10 text-xs md:text-sm h-8 md:h-10 px-4 md:px-6"
              >
                <HelpCircle className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Need Help? View Visual Guide
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 