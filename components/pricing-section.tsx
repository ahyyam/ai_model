"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react"

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "$30",
    period: "",
    description: "Perfect for getting started with image generation.",
    features: ["10 image generations", "Basic styling options", "Email support", "$3.00 per image"],
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
    features: ["20 image generations", "Advanced styling options", "Priority processing", "Priority support", "$2.00 per image"],
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
    features: ["50 image generations", "All Pro features", "Custom integrations", "Dedicated support", "$1.50 per image"],
    popular: false,
    color: "border-blue-600",
    badge: "Best Value ⭐"
  }
]

export default function PricingSection() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  const handleGetStarted = (planName: string) => {
    if (user) {
      // User is logged in, navigate to billing
      router.push("/billing")
    } else {
      // User is not logged in, navigate to signup page
      router.push("/signup")
    }
  }

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto px-4 mb-12">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-400 text-lg">Simple, transparent pricing that scales with your needs.</p>
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="relative h-full pt-2">
              <Card
                className={`bg-[#1c1c1c] border-gray-800 text-white flex flex-col h-full min-h-[400px] transition-all duration-200 hover:scale-105 ${
                  plan.popular 
                    ? `${plan.color} border-2` 
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg border-2 border-blue-400">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="flex-shrink-0 pb-3">
                  <CardTitle className="font-sora text-lg sm:text-xl flex items-center gap-2">
                    {plan.name}
                    {plan.name === "Elite" && <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />}
                  </CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="pt-1 text-gray-400 text-xs sm:text-sm">{plan.description}</p>
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-xs text-gray-300">{plan.badge}</span>
                    {plan.name === "Elite" && <Star className="h-2 w-2 text-yellow-400" />}
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
                    onClick={() => handleGetStarted(plan.name)}
                    className="w-full py-2 text-white text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    {user ? "Get Started" : "Create Account"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
