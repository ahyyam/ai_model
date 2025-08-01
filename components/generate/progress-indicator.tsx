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
    <div className="flex items-center gap-2">
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
  )
}
