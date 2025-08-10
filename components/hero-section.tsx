"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Clock, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const modelImages = [
  "/models/1.jpg",
  "/models/2.jpg",
  "/models/3.jpg",
  "/models/4.jpg",
  "/models/5.jpg",
  "/models/6.jpg",
  "/models/7.jpg",
  "/models/8.jpg",
  "/models/9.jpg",
  "/models/10.jpg",
]

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const leftImageRef = useRef<HTMLDivElement>(null)
  const rightImageRef = useRef<HTMLDivElement>(null)

  // Split images into two groups
  const leftImages = modelImages.slice(0, 5)
  const rightImages = modelImages.slice(5, 10)

  // Intersection Observer to start animation when component is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (leftImageRef.current) {
      observer.observe(leftImageRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Left image animation - slides down
  useEffect(() => {
    if (!isVisible || !leftImageRef.current) return

    const leftContainer = leftImageRef.current
    const scrollSpeed = 0.5
    let scrollPosition = 0
    const maxScroll = leftContainer.scrollHeight / 2

    const scrollDown = () => {
      scrollPosition += scrollSpeed
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0
      }
      leftContainer.scrollTop = scrollPosition
      animationId = requestAnimationFrame(scrollDown)
    }

    let animationId = requestAnimationFrame(scrollDown)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isVisible])

  // Right image animation - slides up
  useEffect(() => {
    if (!isVisible || !rightImageRef.current) return

    const rightContainer = rightImageRef.current
    const scrollSpeed = 0.5
    let scrollPosition = rightContainer.scrollHeight / 2
    const maxScroll = rightContainer.scrollHeight

    const scrollUp = () => {
      scrollPosition -= scrollSpeed
      if (scrollPosition <= 0) {
        scrollPosition = maxScroll
      }
      rightContainer.scrollTop = scrollPosition
      animationId = requestAnimationFrame(scrollUp)
    }

    let animationId = requestAnimationFrame(scrollUp)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isVisible])

  return (
    <section className="min-h-screen flex items-center justify-center pt-16 pb-8 md:pt-20 md:pb-12 relative" role="banner" aria-label="Main hero section" itemScope itemType="https://schema.org/Service">
      
      {/* SEO Meta Tags */}
      <meta itemProp="name" content="Instant AI Photoshoot Service - Professional Fashion Photography in Seconds" />
      <meta itemProp="description" content="Create professional fashion photography instantly with AI. Transform product photos into stunning visuals in seconds. No studio, no models, no waiting. Instant AI photoshoot service for e-commerce brands." />
      <meta itemProp="provider" content="Zarta" />
      <meta itemProp="serviceType" content="Instant AI Fashion Photography" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Main Headline */}
            <header className="mb-6 md:mb-8">
              <h1 className="heading-1 mb-4 md:mb-6 leading-tight" itemProp="headline">
                <span className="text-zarta-gradient text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold block text-center lg:text-left">
                  From Plain Photo To Professional Fashion Campaign in Seconds
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="max-w-2xl mx-auto lg:mx-0 body-large mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl" itemProp="description">
                Upload your garment and model and style reference. Get Hyper Realistic Ai fashion imagery with a single click
              </p>
              
              {/* Key Benefits */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8 text-xs sm:text-sm md:text-base">
                <div className="flex items-center gap-2 md:gap-2.5 text-gray-300 bg-gray-800/30 px-3 py-2 rounded-full">
                  <Clock className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                  <span className="font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 md:gap-2.5 text-gray-300 bg-gray-800/30 px-3 py-2 rounded-full">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                  <span className="font-medium">Professional Quality</span>
                </div>
                <div className="flex items-center gap-2 md:gap-2.5 text-gray-300 bg-gray-800/30 px-3 py-2 rounded-full">
                  <Zap className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                  <span className="font-medium">98% Less Cost</span>
                </div>
              </div>
            </header>
            
            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 md:gap-6 mb-6 md:mb-8">
              <Button
                asChild
                className="btn-primary text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-3 md:py-4 w-full sm:w-auto"
                aria-label="Start instant AI photoshoot"
              >
                <Link href="/generate" title="Start Instant AI Photoshoot - Professional Fashion Photography in Seconds">
                  Start Creating Now <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                </Link>
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 md:gap-6 lg:gap-8 text-xs md:text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 md:-space-x-3">
                  <img src="/icons/rev_icon_1.jpg" alt="Customer Review 1" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-900" />
                  <img src="/icons/rev_icon_2.jpg" alt="Customer Review 2" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-900" />
                  <img src="/icons/rev_icon_3.jpg" alt="Customer Review 3" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-900" />
                </div>
                <span className="font-medium">Trusted by 10,000+ brands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(4)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  <span className="text-yellow-400/60">★</span>
                </div>
                <span className="font-medium">4.5/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right Column - 1.5 Sliding Images */}
          <div className="flex flex-col items-center lg:items-end order-1 lg:order-2 mb-8 lg:mb-0">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
              <div className="flex gap-2 md:gap-3">
                {/* Full Image - Slides Down */}
                <div className="relative aspect-[2/3] sm:aspect-[1/2] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-800/30 shadow-2xl sm:shadow-3xl flex-1">
                  <div 
                    ref={leftImageRef}
                    className="h-full overflow-hidden"
                  >
                    {/* Duplicate images for seamless loop */}
                    {[...leftImages, ...leftImages].map((image, index) => (
                      <div key={index} className="w-full aspect-[2/3] sm:aspect-[1/2]">
                        <img
                          src={image}
                          alt={`AI Fashion Model ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Surrounding gradient overlays */}
                  <div className="absolute top-0 left-0 w-full h-12 sm:h-16 lg:h-20 bg-gradient-to-b from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute bottom-0 left-0 w-full h-12 sm:h-16 lg:h-20 bg-gradient-to-t from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 left-0 w-12 sm:w-16 lg:w-20 h-full bg-gradient-to-r from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 right-0 w-12 sm:w-16 lg:w-20 h-full bg-gradient-to-l from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                </div>

                {/* Half Image - Slides Up */}
                <div className="relative aspect-[2/3] sm:aspect-[1/2] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-800/30 shadow-2xl sm:shadow-3xl w-1/2">
                  <div 
                    ref={rightImageRef}
                    className="h-full overflow-hidden"
                  >
                    {/* Duplicate images for seamless loop */}
                    {[...rightImages, ...rightImages].map((image, index) => (
                      <div key={index} className="w-full aspect-[2/3] sm:aspect-[1/2]">
                        <img
                          src={image}
                          alt={`AI Fashion Model ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Surrounding gradient overlays */}
                  <div className="absolute top-0 left-0 w-full h-12 sm:h-16 lg:h-20 bg-gradient-to-b from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute bottom-0 left-0 w-full h-12 sm:h-16 lg:h-20 bg-gradient-to-t from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 left-0 w-12 sm:w-16 lg:w-20 h-full bg-gradient-to-r from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 right-0 w-12 sm:w-16 lg:w-20 h-full bg-gradient-to-l from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
