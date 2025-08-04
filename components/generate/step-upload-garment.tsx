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
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
  stepTitle: string
  showProgress: boolean
  setShowVisualGuide?: (show: boolean) => void
}

export default function StepUploadGarment({
  formData,
  updateFormData,
  currentStep,
  totalSteps,
  stepTitle,
  showProgress,
  setShowVisualGuide,
}: StepUploadGarmentProps) {
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
            Take a clear photo of the item you want to style. Good lighting and a simple background will give you the best results.
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
                file={formData.garmentImage}
                setFile={(file) => updateFormData({ garmentImage: file })}
                title="Upload Your Garment"
                description="Take a clear photo of the item you want to style"
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
                    <Camera className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-300 mb-2">Quick Tips</h4>
                      <ul className="text-xs text-blue-200 space-y-1">
                        <li>• Use natural lighting for best results</li>
                        <li>• Keep the background simple</li>
                        <li>• Make sure the item is clearly visible</li>
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
                      <Lightbulb className="h-4 w-4 text-blue-400" />
                    </div>
                    Photo Guidelines
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
                        <p className="text-xs text-gray-400 mt-1">Clear, well-lit, simple background</p>
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
                        <p className="text-xs text-gray-400 mt-1">Blurry, cluttered, poor lighting</p>
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
                          Use a white or neutral background for the most versatile results. Natural lighting from a window works best.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Help Button */}
                  {setShowVisualGuide && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVisualGuide(true)}
                        className="w-full border-gray-600 text-gray-300 bg-gray-800/50 hover:bg-gray-700/50"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Need Help?
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
