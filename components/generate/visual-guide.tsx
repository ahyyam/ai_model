"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Palette, Sparkles, Play, Pause, RotateCcw } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface VisualGuideProps {
  onClose?: () => void
}

const guideSteps = [
  {
    id: 1,
    title: "Upload Your Garment",
    description: "Take a clear photo of the item you want to style",
    icon: Camera,
    color: "blue",
    tips: [
      "Use natural lighting for best results",
      "Keep the background simple",
      "Make sure the item is clearly visible",
      "Avoid blurry or low-resolution images"
    ],
    example: "A well-lit photo of a white t-shirt on a plain background"
  },
  {
    id: 2,
    title: "Choose Style Reference",
    description: "Select an image that shows your desired style",
    icon: Palette,
    color: "blue",
    tips: [
      "Choose fashion editorials or lookbooks",
      "Pick images with clear styling",
      "Avoid busy or cluttered scenes",
      "High-quality photography works best"
    ],
    example: "A professional fashion editorial with clear styling"
  },
  {
    id: 3,
    title: "Generate AI Photoshoot",
    description: "Create your personalized AI-generated image",
    icon: Sparkles,
    color: "green",
    tips: [
      "Add optional description for custom results",
      "Generation takes 30-60 seconds",
      "Download and share your results",
      "Save to your project library"
    ],
    example: "Your garment styled in the reference aesthetic"
  }
]

export default function VisualGuide({ onClose }: VisualGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null)
  const isMobile = useIsMobile()

  const startAutoPlay = () => {
    setIsPlaying(true)
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % guideSteps.length)
    }, 3000)
    setAutoPlayInterval(interval)
  }

  const stopAutoPlay = () => {
    setIsPlaying(false)
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval)
      setAutoPlayInterval(null)
    }
  }

  const resetGuide = () => {
    setCurrentStep(0)
    stopAutoPlay()
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    if (isPlaying) {
      stopAutoPlay()
    }
  }

  const toggleAutoPlay = () => {
    if (isPlaying) {
      stopAutoPlay()
    } else {
      startAutoPlay()
    }
  }

  const currentGuideStep = guideSteps[currentStep]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-4xl bg-gradient-to-br from-[#1c1c1c] to-[#171717] border-gray-700/50 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-sora text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              How It Works
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetGuide}
                className="border-gray-700 text-gray-300 bg-gray-800/50 hover:bg-gray-700/50"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoPlay}
                className="border-gray-700 text-gray-300 bg-gray-800/50 hover:bg-gray-700/50"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              {onClose && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="border-gray-700 text-gray-300 bg-gray-800/50 hover:bg-gray-700/50"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Navigation */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              {guideSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300 cursor-pointer
                    ${index === currentStep 
                      ? `bg-${step.color}-500 scale-125` 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left: Visual */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className={`
                w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center
                bg-gradient-to-br from-${currentGuideStep.color}-500/20 to-${currentGuideStep.color}-600/20
                border-2 border-${currentGuideStep.color}-500/30
              `}>
                <currentGuideStep.icon className={`h-16 w-16 text-${currentGuideStep.color}-400`} />
              </div>
              
              <div className="w-full aspect-video bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-sm text-gray-400">Example: {currentGuideStep.example}</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Step {currentGuideStep.id}: {currentGuideStep.title}
                </h3>
                <p className="text-gray-300">{currentGuideStep.description}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-200">Pro Tips:</h4>
                <ul className="space-y-2">
                  {currentGuideStep.tips.map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <div className={`w-1.5 h-1.5 bg-${currentGuideStep.color}-400 rounded-full mt-2 flex-shrink-0`}></div>
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Mobile-specific tips */}
              {isMobile && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    💡 <strong>Mobile Tip:</strong> Use your phone's camera in good lighting for best results.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Progress indicator */}
          <div className="w-full bg-gray-700 rounded-full h-1">
            <motion.div 
              className={`bg-gradient-to-r from-${currentGuideStep.color}-500 to-${currentGuideStep.color}-600 h-1 rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / guideSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
              disabled={currentStep === 0}
              className="border-gray-700 text-gray-300 bg-gray-800/50 hover:bg-gray-700/50"
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-400">
              {currentStep + 1} of {guideSteps.length}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, guideSteps.length - 1))}
              disabled={currentStep === guideSteps.length - 1}
              className="border-gray-700 text-gray-300 bg-gray-800/50 hover:bg-gray-700/50"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
