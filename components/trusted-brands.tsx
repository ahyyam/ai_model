"use client"

import { useEffect, useRef, useState } from "react"

const brands = [
  { name: "Brand 1", logo: "/brand-logos/1.png" },
  { name: "Brand 2", logo: "/brand-logos/2.png" },
  { name: "Brand 3", logo: "/brand-logos/3.png" },
  { name: "Brand 4", logo: "/brand-logos/4.png" },
  { name: "Brand 5", logo: "/brand-logos/5.png" },
  { name: "Brand 6", logo: "/brand-logos/6.png" },
  { name: "Brand 7", logo: "/brand-logos/7.png" },
  { name: "Brand 8", logo: "/brand-logos/8.png" },
  { name: "Brand 9", logo: "/brand-logos/9.png" },
]

export default function TrustedBrands() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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

    if (scrollRef.current) {
      observer.observe(scrollRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5 // Slower, smoother scrolling

    const scroll = () => {
      scrollPosition += scrollSpeed
      const maxScroll = scrollContainer.scrollWidth / 2 // Since we duplicate the brands
      
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0
      }
      
      scrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isVisible])

  return (
    <section className="py-16 md:py-24 border-t border-gray-800/50">
      <div className="text-center mb-16">
        <h3 className="font-sora text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-300 mb-4">
          Trusted by Leading Fashion Brands
        </h3>
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-8 md:gap-12 lg:gap-16 items-center overflow-hidden"
          style={{ scrollBehavior: "auto" }}
        >
          {/* Duplicate the brands array to create seamless loop */}
          {[...brands, ...brands].map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            >
                              <img
                  src={brand.logo || "/placeholder.svg"}
                  alt={`${brand.name} logo`}
                  className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain"
                  style={{ minWidth: "140px" }}
                  loading="lazy"
                />
            </div>
          ))}
        </div>

        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-l from-[#111111] via-[#111111]/80 to-transparent pointer-events-none z-10" />
      </div>
    </section>
  )
} 