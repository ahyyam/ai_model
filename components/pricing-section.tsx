"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState, useRef, useCallback } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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
  const [api, setApi] = useState<any>(null)
  const [current, setCurrent] = useState(1) // Start with Pro (index 1)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
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

    // Set initial position to Pro (index 1)
    setTimeout(() => {
      api.scrollTo(1)
    }, 100)
  }, [api])

  // Intersection Observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleGetStarted = (planName: string) => {
    if (user) {
      // User is logged in, navigate to subscribe page
      router.push("/subscribe")
    } else {
      // User is not logged in, navigate to signup page
      router.push("/signup")
    }
  }

  const scrollTo = (index: number) => {
    api?.scrollTo(index)
  }

  return (
    <section ref={sectionRef} id="pricing" className="section-padding">
      {!isVisible ? (
        <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
      ) : (
        <>
          <div className="container-base mx-auto text-center mb-12 mt-8">
            <h2 className="heading-2 mb-4">Choose Your Plan</h2>
            <p className="body-large">Simple, transparent pricing that scales with your needs.</p>
          </div>
          
          <div className="container-lg mx-auto">
            {/* Desktop: Grid layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="relative h-full">
                  <Card
                    className={`card-zarta flex flex-col h-full min-h-[400px] transition-all duration-200 hover:scale-105 ${
                      plan.popular 
                        ? `${plan.color} border-2` 
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <CardHeader className="flex-shrink-0 pb-3">
                      <CardTitle className="heading-3 flex items-center gap-2">
                        {plan.name}
                        {plan.name === "Elite" && <Star className="icon-sm text-yellow-400" />}
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

            {/* Mobile: Carousel layout with same effect as testimonials */}
            <div className="md:hidden pt-4">
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
                      <CarouselItem key={plan.id} className="pl-4 basis-full">
                        <div className="relative h-full">
                          <Card
                            className={`card-zarta flex flex-col h-full min-h-[400px] transition-all duration-300 ${
                              plan.popular 
                                ? `${plan.color} border-2` 
                                : "border-gray-700"
                            }`}
                          >
                            <CardHeader className="flex-shrink-0 pb-3">
                              <CardTitle className="heading-3 flex items-center gap-2">
                                {plan.name}
                                {plan.name === "Elite" && <Star className="icon-sm text-yellow-400" />}
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
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>

              {/* Dot Navigation - Only show on mobile */}
              <div className="flex justify-center mt-8 gap-2">
                {plans.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      current === index 
                        ? "bg-blue-500 scale-125" 
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                    aria-label={`Go to plan ${index + 1}`}
                  />
                ))}
              </div>

              {/* Swipe hint */}
              <div className="text-center mt-4 text-xs text-gray-500">
                Swipe left or right to explore plans
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
