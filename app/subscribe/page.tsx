"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/firebase"
import { Check, Sparkles, Zap, Crown, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "$30",
    period: "",
    description: "Perfect for getting started with image generation.",
    features: ["10 image generations", "Basic styling options", "Email support"],
    popular: false,
    color: "border-blue-400",
    badge: "Starter"
  },
  {
    id: "pro",
    name: "Pro",
    price: "$40",
    period: "",
    description: "Great value for growing businesses and creators.",
    features: ["20 image generations", "Advanced styling options", "Priority processing", "Priority support"],
    popular: true,
    color: "border-blue-500",
    badge: "Better Value"
  },
  {
    id: "elite",
    name: "Elite",
    price: "$75",
    period: "",
    description: "Best value for high-volume image generation needs.",
    features: ["50 image generations", "All Pro features", "Custom integrations", "Dedicated support"],
    popular: false,
    color: "border-blue-600",
    badge: "Best Value"
  }
]

export default function SubscribePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const handleBack = () => {
    router.back()
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSubscribe = async (planId: string) => {
    if (!user) return

    setIsLoading(true)
    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) {
        throw new Error(`Plan ${planId} not found`)
      }

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planId.toUpperCase(),
          email: user.email,
          successUrl: `${window.location.origin}/projects`,
          cancelUrl: `${window.location.origin}/subscribe`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received from server")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      alert(`Failed to start subscription: ${errorMessage}. Please check your Stripe configuration.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/projects")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden mb-3">
              <img 
                src="/logo/logo.png" 
                alt="Zarta Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="font-sora text-2xl md:text-3xl font-bold mb-2">
              Choose Your Plan
            </h1>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              Simple, transparent pricing that scales with your needs.
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {plans.map((plan) => (
            <div key={plan.id} className="relative h-full">
              <Card
                className={`bg-[#1c1c1c] border-gray-800 text-white flex flex-col h-full min-h-[400px] transition-all duration-200 hover:scale-105 ${
                  plan.popular 
                    ? `${plan.color} border-2` 
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <CardHeader className="flex-shrink-0 pb-3">
                  <CardTitle className="font-sora text-lg sm:text-xl flex items-center gap-2">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="pt-1 text-gray-400 text-xs sm:text-sm">{plan.description}</p>
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-xs text-gray-300">{plan.badge}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 pt-0">
                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full py-2 text-white text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : `Subscribe to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 text-gray-400">
          <p className="text-xs">
            You can change or cancel your subscription at any time from your account settings.
          </p>
        </div>
      </div>
    </div>
  )
} 