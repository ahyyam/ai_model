"use client"

import { useEffect, useRef } from "react"

const brands = [
  { name: "Zara", logo: "/placeholder.svg?height=60&width=120&text=ZARA" },
  { name: "H&M", logo: "/placeholder.svg?height=60&width=120&text=H%26M" },
  { name: "Nike", logo: "/placeholder.svg?height=60&width=120&text=NIKE" },
  { name: "Adidas", logo: "/placeholder.svg?height=60&width=120&text=ADIDAS" },
  { name: "Uniqlo", logo: "/placeholder.svg?height=60&width=120&text=UNIQLO" },
  { name: "Gap", logo: "/placeholder.svg?height=60&width=120&text=GAP" },
  { name: "Levi's", logo: "/placeholder.svg?height=60&width=120&text=LEVI'S" },
  { name: "Calvin Klein", logo: "/placeholder.svg?height=60&width=120&text=CK" },
]

export default function TrustedBrands() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const scrollWidth = scrollContainer.scrollWidth
    const clientWidth = scrollContainer.clientWidth
    let scrollPosition = 0

    const scroll = () => {
      scrollPosition += 1
      if (scrollPosition >= scrollWidth - clientWidth) {
        scrollPosition = 0
      }
      scrollContainer.scrollLeft = scrollPosition
    }

    const intervalId = setInterval(scroll, 30)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className="py-16 md:py-24 border-t border-gray-800">
      <div className="text-center mb-12">
        <h3 className="font-sora text-xl md:text-2xl font-semibold text-gray-400 mb-8">
          Trusted by Leading Fashion Brands
        </h3>
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-12 md:gap-16 items-center overflow-hidden"
          style={{ scrollBehavior: "auto" }}
        >
          {/* Duplicate the brands array to create seamless loop */}
          {[...brands, ...brands].map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <img
                src={brand.logo || "/placeholder.svg"}
                alt={`${brand.name} logo`}
                className="h-8 md:h-12 w-auto filter brightness-0 invert"
                style={{ minWidth: "80px" }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#111111] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#111111] to-transparent pointer-events-none" />
      </div>
    </section>
  )
}
