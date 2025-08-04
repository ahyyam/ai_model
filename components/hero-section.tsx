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
    const scrollSpeed = 0.6
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
    const scrollSpeed = 0.6
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
    <section className="min-h-screen flex items-center justify-center pt-0 pb-4 md:pb-12 relative" role="banner" aria-label="Main hero section" itemScope itemType="https://schema.org/Service">
      
      {/* SEO Meta Tags */}
      <meta itemProp="name" content="Instant AI Photoshoot Service - Professional Fashion Photography in Seconds" />
      <meta itemProp="description" content="Create professional fashion photography instantly with AI. Transform product photos into stunning visuals in seconds. No studio, no models, no waiting. Instant AI photoshoot service for e-commerce brands." />
      <meta itemProp="provider" content="Zarta" />
      <meta itemProp="serviceType" content="Instant AI Fashion Photography" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left">
            {/* Main Headline */}
            <header className="mb-3 md:mb-6">
              <h1 className="heading-1 mb-2 md:mb-4 leading-tight" itemProp="headline">
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 md:gap-3 lg:gap-4 mb-2">
                  <span className="text-zarta-gradient text-3xl md:text-4xl lg:text-5xl">
                    Instant AI
                  </span>
                  <span className="text-blue-500 text-3xl md:text-4xl lg:text-5xl">Photoshoot</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="text-3xl md:text-4xl lg:text-5xl text-gray-300">
                    in Seconds
                  </span>
                </div>
              </h1>
              
              {/* Subtitle */}
              <p className="max-w-2xl mx-auto lg:mx-0 body-large mb-2 md:mb-4 text-base md:text-lg" itemProp="description">
                Transform any product photo into <strong className="text-blue-300">professional fashion photography</strong> instantly. 
                No studio, no models, no waiting. <strong className="text-gray-300">AI-powered photoshoots in seconds</strong>.
              </p>
              
              {/* Key Benefits */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 md:gap-4 mb-3 md:mb-6 text-sm md:text-base">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Professional Quality</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Zap className="h-4 w-4" />
                  <span>95% Cost Savings</span>
                </div>
              </div>
            </header>
            
            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 md:gap-4 mb-3 md:mb-6">
              <Button
                asChild
                className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
                aria-label="Start instant AI photoshoot"
              >
                <Link href="/generate" title="Start Instant AI Photoshoot - Professional Fashion Photography in Seconds">
                  Start Instant Photoshoot <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
              
              <Button
                variant="outline"
                className="btn-secondary text-base md:text-lg px-4 md:px-6 py-3 md:py-4"
              >
                Watch Demo
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col md:flex-row justify-center lg:justify-start items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1 md:-space-x-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-600 rounded-full border-2 border-gray-900"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-600 rounded-full border-2 border-gray-900"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-600 rounded-full border-2 border-gray-900"></div>
                </div>
                <span>Trusted by 10,000+ brands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-gray-300">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right Column - Two Side-by-Side Sliding Images */}
          <div className="flex flex-col items-center lg:items-end">
            <div className="relative w-full max-w-2xl">
              <div className="grid grid-cols-2 gap-0">
                {/* Left Image - Slides Down */}
                <div className="relative aspect-[2/3] rounded-none overflow-hidden bg-gray-800/30 shadow-2xl">
                  <div 
                    ref={leftImageRef}
                    className="h-full overflow-hidden"
                  >
                    {/* Duplicate images for seamless loop */}
                    {[...leftImages, ...leftImages].map((image, index) => (
                      <div key={index} className="w-full aspect-[2/3]">
                        <img
                          src={image}
                          alt={`AI Fashion Model ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Surrounding gradient overlays */}
                  <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                </div>

                {/* Right Image - Slides Up */}
                <div className="relative aspect-[2/3] rounded-none overflow-hidden bg-gray-800/30 shadow-2xl">
                  <div 
                    ref={rightImageRef}
                    className="h-full overflow-hidden"
                  >
                    {/* Duplicate images for seamless loop */}
                    {[...rightImages, ...rightImages].map((image, index) => (
                      <div key={index} className="w-full aspect-[2/3]">
                        <img
                          src={image}
                          alt={`AI Fashion Model ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Surrounding gradient overlays */}
                  <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
