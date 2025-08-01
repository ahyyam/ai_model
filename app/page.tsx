"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import HowItWorks from "@/components/how-it-works"
import FeatureSection from "@/components/feature-section"
import BeforeAfterSlider from "@/components/before-after-slider"
import PricingSection from "@/components/pricing-section"
import FaqSection from "@/components/faq-section"
import Footer from "@/components/footer"
import { CheckCircle, Zap, Infinity } from "lucide-react"
import TrustedBrands from "@/components/trusted-brands"
import TestimonialsSection from "@/components/testimonials-section"

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
      <Header />
      <main className="container mx-auto px-4 md:px-6">
        <HeroSection />
        <HowItWorks />
        <TrustedBrands />
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
            description="Capture your audience's attention with stunning, unique visuals that stand out. Brands using Modelix.ai see an average 40% increase in click-through rates."
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
        <BeforeAfterSlider />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}
