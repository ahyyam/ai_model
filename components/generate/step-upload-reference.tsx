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
  const isMobile = useIsMobile()

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="px-4 md:px-6 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {stepTitle}
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Choose an image that shows the style you want. Fashion editorials and lookbooks work best for clear styling inspiration.
          </p>
        </motion.div>


      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Left Column - File Uploader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <FileUploader
                file={formData.referenceImage}
                setFile={(file) => updateFormData({ referenceImage: file })}
                title="Upload Style Reference"
                description="Choose an image that shows the style you want"
              />

              {/* Mobile-specific quick tips */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <ImageIcon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-300 mb-2">Style Tips</h4>
                      <ul className="text-xs text-blue-200 space-y-1">
                        <li>• Choose fashion editorials or lookbooks</li>
                        <li>• Pick images with clear styling</li>
                        <li>• Avoid busy or cluttered scenes</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right Column - Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-full"
            >
              <Card className="bg-gradient-to-br from-[#1c1c1c] to-[#171717] border-2 border-gray-700/50 text-white shadow-xl h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="font-sora text-lg flex items-center gap-2">
                    <div className="p-1 bg-blue-500/20 rounded-lg">
                      <Palette className="h-4 w-4 text-blue-400" />
                    </div>
                    Style Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Visual Examples */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-200 text-sm">Examples:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="mb-2">
                          <h5 className="font-medium text-green-400 flex items-center justify-center gap-1 text-sm">
                            <Check className="h-3 w-3" />
                            Do This
                          </h5>
                        </div>
                        <div className="relative mb-2">
                          <Image
                            src="/placeholder.svg?height=120&width=120"
                            alt="Good example"
                            width={120}
                            height={120}
                            className="rounded-lg border-2 border-green-500/50 object-cover w-full aspect-square"
                          />
                          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-green-400 font-medium">Good</p>
                        <p className="text-xs text-gray-400 mt-1">Clear styling, professional photography</p>
                      </div>
                      <div className="text-center">
                        <div className="mb-2">
                          <h5 className="font-medium text-red-400 flex items-center justify-center gap-1 text-sm">
                            <X className="h-3 w-3" />
                            Avoid This
                          </h5>
                        </div>
                        <div className="relative mb-2">
                          <Image
                            src="/placeholder.svg?height=120&width=120"
                            alt="Bad example"
                            width={120}
                            height={120}
                            className="rounded-lg border-2 border-red-500/50 object-cover w-full aspect-square"
                          />
                          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-red-400 font-medium">Avoid</p>
                        <p className="text-xs text-gray-400 mt-1">Busy background, unclear styling</p>
                      </div>
                    </div>
                  </div>

                  {/* Style Tips */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-200 text-sm">Style Tips:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-green-300 font-medium mb-1">Fashion Editorials</p>
                            <p className="text-green-200 text-xs">Professional photography with clear styling</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-green-300 font-medium mb-1">Lookbooks</p>
                            <p className="text-green-200 text-xs">Brand catalogs with consistent styling</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-red-300 font-medium mb-1">Busy Scenes</p>
                            <p className="text-red-200 text-xs">Cluttered backgrounds distract from style</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-red-300 font-medium mb-1">Low Quality</p>
                            <p className="text-red-200 text-xs">Blurry or pixelated images don't work well</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tip */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-300 font-medium mb-2">Pro Tip</p>
                        <p className="text-sm text-blue-200">
                          Choose reference images that match your desired aesthetic. The AI will use this to understand your style preferences.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
