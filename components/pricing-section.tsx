"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

const plans = [
  {
    name: "Basic",
    price: "$30",
    period: "",
    description: "Perfect for getting started with image generation.",
    features: ["10 image generations", "Basic styling options", "Email support", "$3.00 per image"],
    isPopular: false,
    color: "border-blue-400",
    buttonColor: "btn-primary",
    badge: "Starter"
  },
  {
    name: "Pro",
    price: "$40",
    period: "",
    description: "Great value for growing businesses and creators.",
    features: ["20 image generations", "Advanced styling options", "Priority processing", "Priority support", "$2.00 per image"],
    isPopular: true,
    color: "border-blue-500",
    buttonColor: "btn-primary",
    badge: "Better Value"
  },
  {
    name: "Elite",
    price: "$75",
    period: "",
    description: "Best value for high-volume image generation needs.",
    features: ["50 image generations", "All Pro features", "Custom integrations", "Dedicated support", "$1.50 per image"],
    isPopular: false,
    color: "border-blue-600",
    buttonColor: "btn-primary",
    badge: "Best Value ⭐"
  },
]

export default function PricingSection() {
  const [api, setApi] = useState<any>(null)
  const [current, setCurrent] = useState(1) // Start with Pro plan (index 1)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!api) return

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })

    // Start with Pro plan (index 1)
    api.scrollTo(1)
  }, [api])

  const scrollTo = (index: number) => {
    api?.scrollTo(index)
  }

  const handleGetStarted = (planName: string) => {
    if (user) {
      // User is logged in, navigate to billing
      router.push("/billing")
    } else {
      // User is not logged in, navigate to login page
      router.push("/login")
    }
  }

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto px-4">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-400 text-lg mb-12">Simple, transparent pricing that scales with your needs.</p>
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              containScroll: "trimSnaps",
              dragFree: false,
            }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {plans.map((plan, index) => (
                <CarouselItem key={plan.name} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="relative h-full pt-3">
                    <Card
                      className={cn(
                        "bg-[#1c1c1c] border-gray-800 text-white flex flex-col h-full min-h-[500px]",
                        plan.isPopular && `${plan.color} border-2`,
                      )}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-50">
                          <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg border-2 border-blue-400">
                            Most Popular
                          </div>
                        </div>
                      )}
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="font-sora text-xl sm:text-2xl flex items-center gap-2">
                          {plan.name}
                          {plan.name === "Elite" && <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />}
                        </CardTitle>
                        <div className="flex items-baseline">
                          <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                          <span className="text-gray-400">{plan.period}</span>
                        </div>
                        <CardDescription className="pt-2 !text-gray-400 text-sm sm:text-base">{plan.description}</CardDescription>
                        <div className="flex items-center gap-1 pt-1">
                          <span className="text-xs sm:text-sm text-gray-300">{plan.badge}</span>
                          {plan.name === "Elite" && <Star className="h-3 w-3 text-yellow-400" />}
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-3">
                              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                              <span className="text-sm sm:text-base">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={cn(
                            "w-full text-white text-sm sm:text-base",
                            plan.buttonColor
                          )}
                          onClick={() => handleGetStarted(plan.name)}
                        >
                          {user ? "Get Started" : "Create Account"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Dot Navigation - Only show on mobile/tablet where scrolling is needed */}
        <div className="flex justify-center mt-8 gap-2 lg:hidden">
          {plans.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index 
                  ? "bg-blue-500 scale-125" 
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to ${plans[index].name} plan`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
