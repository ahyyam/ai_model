import { ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
}

const stepLabels = ["Upload Garment", "Upload Reference", "Generate"]

export default function ProgressIndicator({ currentStep, totalSteps, stepTitle }: ProgressIndicatorProps) {
  const isMobile = useIsMobile()

  return (
    <div className="w-full">
      {/* Step Title - Top */}
      <div className="text-center mb-2 sm:mb-3">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">{stepLabels[currentStep]}</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Step {currentStep + 1} of {totalSteps}</p>
      </div>
    </div>
  )
}
