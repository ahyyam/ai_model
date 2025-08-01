"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import type { FormData } from "./onboarding-flow"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

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
  }

  const handleNext = () => {
    updateFormData({ aesthetic: selectedAesthetics.join(", ") })
    onNext()
  }

  return (
    <div className="text-center max-w-6xl mx-auto">
      <h1 className="font-sora text-3xl md:text-4xl font-bold mb-4">Which fashion aesthetic best fits your brand?</h1>
      <p className="text-gray-400 text-lg mb-12">
        Select one or more styles that match your brand. This helps us tailor the AI to your aesthetic.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 max-w-6xl mx-auto">
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
            <CardContent className="p-0 relative flex items-center h-24">
              <div className="w-20 h-full flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={96}
                  className="w-full h-full object-cover rounded-l-lg"
                />
              </div>
              <div className="flex-[2] px-4 flex items-center justify-center">
                <p className="font-semibold text-sm text-center leading-tight">{item.name}</p>
              </div>
              {selectedAesthetics.includes(item.name) && (
                <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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

      <Button
        onClick={handleNext}
        disabled={selectedAesthetics.length === 0}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
