"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useEffect, useState, useRef, useCallback } from "react"

const testimonials = [
  {
    quote:
              "Zarta transformed our product photography workflow. We went from spending $5K per photoshoot to generating unlimited variations for $49/month. Our conversion rates increased by 35%.",
    author: "Sarah Chen",
    title: "Marketing Director",
    company: "Urban Thread Co.",
    rating: 5,
  },
  {
    quote:
      "The quality is incredible. Our customers can't tell the difference between AI-generated images and traditional photography. It's saved us months of production time.",
    author: "Marcus Rodriguez",
    title: "Founder",
    company: "Streetwear Collective",
    rating: 5,
  },
  {
    quote:
              "As a small brand, we couldn't afford professional photoshoots for every product. Zarta leveled the playing field and made our products look as premium as the big brands.",
    author: "Emma Thompson",
    title: "Creative Director",
    company: "Minimalist Studio",
    rating: 5,
  },
  {
    quote:
      "The speed and consistency of Zarta's AI-generated images have revolutionized our e-commerce strategy. We can now create product variations in minutes, not weeks.",
    author: "David Kim",
    title: "E-commerce Manager",
    company: "Fashion Forward",
    rating: 5,
  },
  {
    quote:
      "Zarta's AI understands our brand aesthetic perfectly. Every generated image maintains our signature style while showcasing products beautifully.",
    author: "Lisa Park",
    title: "Brand Director",
    company: "Minimalist Co.",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  const [api, setApi] = useState<any>(null)
  const [current, setCurrent] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!api) return

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
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

  const scrollTo = (index: number) => {
    api?.scrollTo(index)
  }

  return (
    <section ref={sectionRef} className="py-20 md:py-32">
      {!isVisible ? (
        <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
      ) : (
        <>
          <div className="text-center max-w-3xl mx-auto mb-16 px-4">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">Loved by Fashion Brands</h2>
        <p className="text-gray-400 text-lg">See what our customers are saying about their results.</p>
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
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <Card className="bg-[#1c1c1c] border-gray-800 text-white h-full hover:border-gray-700 transition-all duration-300">
                    <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      <blockquote className="text-gray-300 mb-6 flex-grow leading-relaxed text-sm sm:text-base">
                        "{testimonial.quote}"
                      </blockquote>

                      <div className="mt-auto">
                        <div className="font-semibold text-white text-sm sm:text-base">{testimonial.author}</div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          {testimonial.title} at {testimonial.company}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Dot Navigation - Only show on mobile/tablet where scrolling is needed */}
        <div className="flex justify-center mt-8 gap-2 lg:hidden">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index 
                  ? "bg-blue-500 scale-125" 
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
        </>
      )}
    </section>
  )
}
