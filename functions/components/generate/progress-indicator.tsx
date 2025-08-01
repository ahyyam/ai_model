import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
}

const stepLabels = ["Upload Garment", "Reference Image", "Generate Image"]

export default function ProgressIndicator({ currentStep, totalSteps, stepTitle }: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: Show current step title */}
      <div className="md:hidden mb-4">
        <h2 className="text-lg font-semibold text-white">{stepTitle}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-400">Step {currentStep + 1} of {totalSteps}</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop: Show full progress with labels */}
      <div className="hidden md:flex items-center gap-2">
        {stepLabels.map((label, index) => (
          <div key={index} className="flex items-center">
            {/* Step Label */}
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                index <= currentStep ? "text-white" : "text-gray-500",
              )}
            >
              {label}
            </span>

            {/* Arrow Separator */}
            {index < stepLabels.length - 1 && (
              <ChevronRight
                className={cn("h-4 w-4 mx-3 transition-colors", index < currentStep ? "text-white" : "text-gray-600")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
