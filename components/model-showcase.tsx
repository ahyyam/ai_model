"use client"

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

export default function ModelShowcase() {
  const topScrollRef = useRef<HTMLDivElement>(null)
  const bottomScrollRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Split images into two rows
  const topRowImages = modelImages.slice(0, 5)
  const bottomRowImages = modelImages.slice(5, 10)

  useEffect(() => {
    // Intersection Observer to start animation when component is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (topScrollRef.current) {
      observer.observe(topScrollRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Top row animation - completely independent
  useEffect(() => {
    if (!isVisible) return

    const topScrollContainer = topScrollRef.current
    if (!topScrollContainer) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5

    const scrollLeft = () => {
      scrollPosition -= scrollSpeed
      const maxScroll = topScrollContainer.scrollWidth / 2
      
      if (scrollPosition <= -maxScroll) {
        scrollPosition = 0
      }
      
      topScrollContainer.scrollLeft = Math.abs(scrollPosition)
      animationId = requestAnimationFrame(scrollLeft)
    }

    animationId = requestAnimationFrame(scrollLeft)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isVisible])

  // Bottom row animation - completely independent
  useEffect(() => {
    if (!isVisible) return

    const bottomScrollContainer = bottomScrollRef.current
    if (!bottomScrollContainer) return

    let animationId: number
    let scrollPosition = bottomScrollContainer.scrollWidth / 2 // Start from the middle
    const scrollSpeed = 0.5

    const scrollRight = () => {
      scrollPosition -= scrollSpeed // Decrease to go right (since we start from middle)
      const maxScroll = bottomScrollContainer.scrollWidth / 2
      
      if (scrollPosition <= 0) {
        scrollPosition = maxScroll
      }
      
      bottomScrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(scrollRight)
    }

    animationId = requestAnimationFrame(scrollRight)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isVisible])

  return (
    <section className="section-zarta-sm border-t border-gray-800/50">
      <div className="text-center max-w-4xl mx-auto mb-16 space-md">
        <h2 className="heading-2 text-white">See Our AI Models in Action</h2>
        <p className="text-lead text-gray-400">Professional fashion photography generated with AI technology</p>
      </div>
      
      <div className="space-y-12">
        {/* Top row - slides left */}
        <div className="relative overflow-hidden">
          <div
            ref={topScrollRef}
            className="flex gap-8 md:gap-10 lg:gap-12 items-center overflow-hidden"
            style={{ scrollBehavior: "auto" }}
          >
            {/* Duplicate the top row images array to create seamless loop */}
            {[...topRowImages, ...topRowImages].map((image, index) => (
              <div
                key={`top-${image}-${index}`}
                className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                <img
                  src={image}
                  alt={`AI Model ${index + 1}`}
                  className="h-44 md:h-52 w-auto object-cover rounded-xl shadow-lg"
                  style={{ minWidth: "180px" }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-l from-[#111111] via-[#111111]/80 to-transparent pointer-events-none z-10" />
        </div>

        {/* Bottom row - slides right */}
        <div className="relative overflow-hidden">
          <div
            ref={bottomScrollRef}
            className="flex gap-8 md:gap-10 lg:gap-12 items-center overflow-hidden"
            style={{ scrollBehavior: "auto" }}
          >
            {/* Duplicate the bottom row images array to create seamless loop */}
            {[...bottomRowImages, ...bottomRowImages].map((image, index) => (
              <div
                key={`bottom-${image}-${index}`}
                className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                <img
                  src={image}
                  alt={`AI Model ${index + 6}`}
                  className="h-44 md:h-52 w-auto object-cover rounded-xl shadow-lg"
                  style={{ minWidth: "180px" }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-l from-[#111111] via-[#111111]/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  )
} 