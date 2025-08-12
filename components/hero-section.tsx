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
    <section className="min-h-[75svh] md:min-h-[80svh] lg:min-h-[90svh] flex items-center justify-center pt-16 pb-8 relative" role="banner" aria-label="Main hero section" itemScope itemType="https://schema.org/Service">
      
      {/* SEO Meta Tags */}
      <meta itemProp="name" content="Instant AI Photoshoot Service - Professional Fashion Photography in Seconds" />
      <meta itemProp="description" content="Create professional fashion photography instantly with AI. Transform product photos into stunning visuals in seconds. No studio, no models, no waiting. Instant AI photoshoot service for e-commerce brands." />
      <meta itemProp="provider" content="Zarta" />
      <meta itemProp="serviceType" content="Instant AI Fashion Photography" />
      
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left order-1 space-lg mb-8 lg:mb-0">
            {/* Main Headline */}
            <header className="space-lg">
              <h1 className="space-md" itemProp="headline">
                <span className="heading-2 block mx-auto lg:mx-0 max-w-[22ch] text-center lg:text-left">
                  Transform Plain Photos Into Professional Fashion Campaigns in Seconds
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="max-w-3xl mx-auto lg:mx-0 text-body text-gray-300 text-balance" itemProp="description">
                Upload your garment and style reference. Get hyper-realistic AI fashion imagery that converts customers and drives sales with a single click.
              </p>
              
              {/* Key Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="flex items-center gap-2 text-gray-300 bg-gray-800/30 px-3 py-2 rounded-full">
                  <Clock className="icon-base text-blue-400" />
                  <span className="text-body-sm font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 bg-gray-800/30 px-3 py-2 rounded-full">
                  <Sparkles className="icon-base text-blue-400" />
                  <span className="text-body-sm font-medium">Studio Quality</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 bg-gray-800/30 px-3 py-2 rounded-full">
                  <Zap className="icon-base text-blue-400" />
                  <span className="text-body-sm font-medium">95% Cost Savings</span>
                </div>
              </div>
            </header>
            
            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 sm:gap-4">
              <Button
                asChild
                className="btn-primary w-full sm:w-auto px-8 py-4 text-base md:px-10 md:py-5 md:text-lg"
                aria-label="Start instant AI photoshoot"
              >
                <Link href="/generate" title="Start Creating Now - Generate AI Fashion Photography">
                  Start Creating Now <ArrowRight className="ml-2.5 h-5 w-5 md:h-6 md:w-6" />
                </Link>
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 text-caption">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src="/icons/rev_icon_1.jpg" alt="Customer Review 1" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-gray-900" />
                  <img src="/icons/rev_icon_2.jpg" alt="Customer Review 2" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-gray-900" />
                  <img src="/icons/rev_icon_3.jpg" alt="Customer Review 3" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-gray-900" />
                </div>
                <span className="font-medium">Trusted by 10,000+ fashion brands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="font-medium">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right Column - 1.5 Sliding Images */}
          <div className="flex flex-col items-center lg:items-end order-2 mb-8 lg:mb-0">
            <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
              <div className="flex gap-3 lg:gap-4">
                {/* Full Image - Slides Down */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800/30 shadow-2xl flex-1">
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
                  <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                </div>

                {/* Half Image - Slides Up */}
                <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-gray-800/30 shadow-xl sm:shadow-2xl w-1/2">
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
                  <div className="absolute top-0 left-0 w-full h-8 sm:h-12 bg-gradient-to-b from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute bottom-0 left-0 w-full h-8 sm:h-12 bg-gradient-to-t from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 left-0 w-8 sm:w-12 h-full bg-gradient-to-r from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 right-0 w-8 sm:w-12 h-full bg-gradient-to-l from-[#111111]/80 to-transparent pointer-events-none z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
