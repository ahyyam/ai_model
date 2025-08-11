"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
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
    price: "$29",
    period: "",
    description: "Perfect for small brands and creators getting started with AI fashion photography.",
    features: ["10 AI image generations", "Basic styling options", "Standard model types", "Email support", "HD downloads"],
    popular: false,
    color: "border-blue-400",
    badge: "Starter"
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    period: "",
    description: "Ideal for growing businesses and active e-commerce brands.",
    features: ["20 AI image generations", "Advanced styling options", "Premium model types", "Priority processing", "Priority support", "4K downloads"],
    popular: true,
    color: "border-blue-500",
    badge: "Most Popular"
  },
  {
    id: "elite",
    name: "Elite",
    price: "$74",
    period: "",
    description: "Best for high-volume brands and agencies requiring maximum output.",
    features: ["50 AI image generations", "All Pro features", "Custom brand training", "API access", "Dedicated support", "Unlimited revisions"],
    popular: false,
    color: "border-blue-600",
    badge: "Best Value"
  }
]

export default function PricingSection() {
  const [user, setUser] = useState<any>(null)
  const [api, setApi] = useState<any>(null)
  const [current, setCurrent] = useState(1) // Start with Pro (index 1)
  const isVisible = true
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

  // Render immediately without intersection gating

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
          <div className="container-zarta mx-auto text-center mb-16 space-md">
            <h2 className="heading-2">Choose Your Plan</h2>
          </div>
          
          <div className="container-zarta mx-auto">
            {/* Desktop: Grid layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12">
              {plans.map((plan) => (
                <div key={plan.id} className="relative h-full">
                  <Card
                    className={`card-zarta-hover flex flex-col h-full min-h-[450px] transition-all duration-300 hover:scale-105 ${
                      plan.popular 
                        ? `${plan.color} border-2` 
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <CardHeader className="flex-shrink-0 pb-6 space-md">
                      <CardTitle className="heading-3 flex items-center gap-3">
                        {plan.name}
                      </CardTitle>
                      <div className="flex items-baseline">
                        <span className="heading-2">{plan.price}</span>
                        <span className="text-muted ml-2">{plan.period}</span>
                      </div>
                      <p className="text-body text-gray-400">{plan.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="badge-secondary">{plan.badge}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col flex-1 pt-0 space-lg">
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <Check className="icon-base text-blue-500 flex-shrink-0" />
                            <span className="text-body-sm text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        onClick={() => handleGetStarted(plan.name)}
                        className="btn-primary w-full"
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
                            className={`card-zarta-hover flex flex-col h-full min-h-[450px] transition-all duration-300 ${
                              plan.popular 
                                ? `${plan.color} border-2` 
                                : "border-gray-700"
                            }`}
                          >
                            <CardHeader className="flex-shrink-0 pb-6 space-md">
                              <CardTitle className="heading-3 flex items-center gap-3">
                                {plan.name}
                              </CardTitle>
                              <div className="flex items-baseline">
                                <span className="heading-2">{plan.price}</span>
                                <span className="text-muted ml-2">{plan.period}</span>
                              </div>
                              <p className="text-body text-gray-400">{plan.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="badge-secondary">{plan.badge}</span>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="flex flex-col flex-1 pt-0 space-lg">
                              <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-center gap-3">
                                    <Check className="icon-base text-blue-500 flex-shrink-0" />
                                    <span className="text-body-sm text-gray-300">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              
                              <Button
                                onClick={() => handleGetStarted(plan.name)}
                                className="btn-primary w-full"
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
