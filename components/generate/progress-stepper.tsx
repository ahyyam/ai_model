import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStepperProps {
  currentStep: number
  steps: Array<{
    id: string
    title: string
    description?: string
  }>
}

export default function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isUpcoming = index > currentStep

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-300",
                isCompleted && "bg-blue-600 text-white",
                isCurrent && "bg-blue-600 text-white",
                isUpcoming && "bg-gray-700 text-gray-400",
              )}
            >
              {isCompleted ? <Check className="h-3 w-3" /> : <span>{index + 1}</span>}
            </div>

            {/* Step Label */}
            <span
              className={cn(
                "ml-2 text-sm font-medium transition-colors",
                (isCompleted || isCurrent) && "text-white",
                isUpcoming && "text-gray-400",
              )}
            >
              {step.title}
            </span>

            {/* Connector Line */}
            {index < steps.length - 1 && <div className="mx-3 w-8 h-px bg-gray-700" />}
          </div>
        )
      })}
    </div>
  )
}
