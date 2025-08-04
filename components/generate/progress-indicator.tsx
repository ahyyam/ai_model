import { ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
}

const stepLabels = ["Upload Garment", "Reference Image", "Generate Image"]
const stepDescriptions = [
  "Upload a clear photo of your garment",
  "Choose a style reference image", 
  "Create your AI photoshoot"
]

export default function ProgressIndicator({ currentStep, totalSteps, stepTitle }: ProgressIndicatorProps) {
  const isMobile = useIsMobile()

  return (
    <div className="w-full">
      {/* Mobile: Enhanced step display */}
      <div className="md:hidden space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-1">{stepTitle}</h2>
          <p className="text-sm text-gray-400">{stepDescriptions[currentStep]}</p>
        </div>
        
        {/* Mobile Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Mobile Step Indicators */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {stepLabels.map((label, index) => (
              <div key={index} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                  index < currentStep 
                    ? "bg-green-500 text-white" 
                    : index === currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-400"
                )}>
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < stepLabels.length - 1 && (
                  <div className={cn(
                    "w-6 h-0.5 mx-1 transition-all duration-300",
                    index < currentStep ? "bg-green-500" : "bg-gray-700"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Ultra compact progress with labels */}
      <div className="hidden md:block">


        <div className="flex items-center gap-2">
          {stepLabels.map((label, index) => (
            <div key={index} className="flex items-center">
              {/* Step Circle */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 relative",
                index < currentStep 
                  ? "bg-green-500 text-white" 
                  : index === currentStep
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400"
              )}>
                {index < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  index + 1
                )}
                
                {/* Pulse animation for current step */}
                {index === currentStep && (
                  <motion.div
                    className="absolute inset-0 bg-blue-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Step Label */}
              <div className="ml-1.5">
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    index <= currentStep ? "text-white" : "text-gray-500",
                  )}
                >
                  {label}
                </span>
                <p className={cn(
                  "text-xs transition-colors",
                  index <= currentStep ? "text-gray-300" : "text-gray-600"
                )}>
                  {stepDescriptions[index]}
                </p>
              </div>

              {/* Arrow Separator */}
              {index < stepLabels.length - 1 && (
                <ChevronRight
                  className={cn(
                    "h-3 w-3 mx-2 transition-colors",
                    index < currentStep ? "text-green-500" : "text-gray-600"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Desktop Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
