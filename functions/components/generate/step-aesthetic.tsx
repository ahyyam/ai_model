"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import type { FormData } from "./onboarding-flow"
import { useState } from "react"

const aesthetics = [
  { name: "High Fashion", image: "/placeholder.svg?height=200&width=300" },
  { name: "Streetwear", image: "/placeholder.svg?height=200&width=300" },
  { name: "Minimal/Clean", image: "/placeholder.svg?height=200&width=300" },
  { name: "Casual Everyday", image: "/placeholder.svg?height=200&width=300" },
  { name: "Performance", image: "/placeholder.svg?height=200&width=300" },
  { name: "Vintage/Retro", image: "/placeholder.svg?height=200&width=300" },
  { name: "Bohemian", image: "/placeholder.svg?height=200&width=300" },
  { name: "Luxury", image: "/placeholder.svg?height=200&width=300" },
]

interface StepAestheticProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  currentStep?: number
  totalSteps?: number
  stepTitle?: string
  showProgress?: boolean
}

export default function StepAesthetic({ formData, updateFormData, onNext }: StepAestheticProps) {
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([])

  const handleSelect = (aesthetic: string) => {
    setSelectedAesthetics((prev) => {
      if (prev.includes(aesthetic)) {
        return prev.filter((item) => item !== aesthetic)
      } else {
        return [...prev, aesthetic]
      }
    })
    
    // Update form data immediately when selection changes
    const newSelection = selectedAesthetics.includes(aesthetic) 
      ? selectedAesthetics.filter((item) => item !== aesthetic)
      : [...selectedAesthetics, aesthetic]
    
    updateFormData({ aesthetic: newSelection.join(", ") })
  }

  return (
    <div className="text-center max-w-6xl mx-auto px-4">
      <h1 className="font-sora text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Which fashion aesthetic best fits your brand?</h1>
      <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-12 px-4">
        Select one or more styles that match your brand. This helps us tailor the AI to your aesthetic.
      </p>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-8 max-w-7xl mx-auto">
        {aesthetics.map((item) => (
          <Card
            key={item.name}
            onClick={() => handleSelect(item.name)}
            className={`bg-[#1c1c1c] border-gray-800 text-white cursor-pointer group overflow-hidden hover:-translate-y-1 transition-all duration-300 ${
              selectedAesthetics.includes(item.name)
                ? "border-blue-500 border-2 bg-blue-500/10"
                : "hover:border-gray-600"
            }`}
          >
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 relative">
              <div className="aspect-square mb-2 sm:mb-3 md:mb-4">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg">{item.name}</p>
              </div>
              {selectedAesthetics.includes(item.name) && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-gray-400">
        {selectedAesthetics.length > 0 ? (
          <p>Selected: {selectedAesthetics.join(", ")}</p>
        ) : (
          <p>Please select at least one aesthetic to continue</p>
        )}
      </div>
    </div>
  )
}
