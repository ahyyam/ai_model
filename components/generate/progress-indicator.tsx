import { ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
}

const stepLabels = ["Garment", "Reference", "Generate"]

export default function ProgressIndicator({ currentStep, totalSteps, stepTitle }: ProgressIndicatorProps) {
  const isMobile = useIsMobile()

  return (
    <div className="w-full">
      {/* Step Title - Top */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stepLabels[currentStep]}</h1>
      </div>

      {/* Mobile: Simplified progress bar only */}
      <div className="md:hidden space-y-4">
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
      </div>

      {/* Desktop: Progress bar only */}
      <div className="hidden md:block">
        {/* Desktop Progress Bar */}
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
  )
}
