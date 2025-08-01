"use client"

import { useEffect, Suspense, lazy } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import HowItWorks from "@/components/how-it-works"
import FeatureSection from "@/components/feature-section"
import { CheckCircle, Zap, Infinity } from "lucide-react"
import StructuredData, { OrganizationData, WebsiteData, ProductData } from "@/components/seo/structured-data"

// Lazy load components that are below the fold
const BeforeAfterSlider = lazy(() => import("@/components/before-after-slider"))
const PricingSection = lazy(() => import("@/components/pricing-section"))
const FaqSection = lazy(() => import("@/components/faq-section"))
const Footer = lazy(() => import("@/components/footer"))
const TrustedBrands = lazy(() => import("@/components/trusted-brands"))
const TestimonialsSection = lazy(() => import("@/components/testimonials-section"))

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.replace("/projects")
    })
    return () => unsubscribe()
  }, [router])

  return (
    <div className="bg-[#111111] text-white">
      {/* SEO Structured Data */}
      <StructuredData type="organization" data={OrganizationData} />
      <StructuredData type="website" data={WebsiteData} />
      <StructuredData type="product" data={ProductData} />
      
      <Header />
      <main className="container mx-auto px-4 md:px-6">
        <HeroSection />
        <HowItWorks />
        <Suspense fallback={<div className="h-32 bg-gray-800 animate-pulse rounded-lg" />}>
          <TrustedBrands />
        </Suspense>
        <section id="features" className="py-20 md:py-32 space-y-24">
          <FeatureSection
            title="Infinite Styles, Zero Photoshoots"
            description="Say goodbye to expensive, time-consuming photoshoots. Generate an endless variety of on-model images, lifestyle shots, and creative compositions in minutes."
            imageUrl="/placeholder.svg?height=500&width=500"
            Icon={Infinity}
            benefit="Save Time & Money"
          />
          <FeatureSection
            title="Boost Engagement & Conversions"
            description="Capture your audience's attention with stunning, unique visuals that stand out. Brands using Zarta see an average 40% increase in click-through rates."
            imageUrl="/placeholder.svg?height=500&width=500"
            Icon={Zap}
            benefit="Increase Sales"
            reverse
          />
          <FeatureSection
            title="On-Brand, Every Time"
            description="Maintain perfect brand consistency. Our AI understands your aesthetic, generating images that align with your brand's mood, color palette, and style guidelines."
            imageUrl="/placeholder.svg?height=500&width=500"
            Icon={CheckCircle}
            benefit="Strengthen Brand Identity"
          />
        </section>
        <Suspense fallback={<div className="h-[500px] bg-gray-800 animate-pulse rounded-lg" />}>
          <BeforeAfterSlider />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <PricingSection />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <FaqSection />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  )
}
