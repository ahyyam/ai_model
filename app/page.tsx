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
    <div className="bg-[#111111] text-white" itemScope itemType="https://schema.org/WebPage">
      {/* SEO Structured Data */}
      <StructuredData type="organization" data={OrganizationData} />
      <StructuredData type="website" data={WebsiteData} />
      <StructuredData type="product" data={ProductData} />
      
      <Header />
      <main className="container mx-auto px-4 md:px-6" role="main">
        <article itemScope itemType="https://schema.org/Article">
          <meta itemProp="headline" content="AI-Powered Fashion Photography | Transform Product Photos" />
          <meta itemProp="description" content="Transform plain clothing product photos into styled, high-quality, scroll-stopping visuals using AI. Save 95% on photoshoot costs with instant professional fashion photography for e-commerce brands." />
          <meta itemProp="author" content="Zarta Team" />
          <meta itemProp="publisher" content="Zarta" />
          <meta itemProp="datePublished" content="2024-01-01" />
          <meta itemProp="dateModified" content={new Date().toISOString().split('T')[0]} />
        <HeroSection />
        <HowItWorks />
        <Suspense fallback={<div className="h-32 bg-gray-800 animate-pulse rounded-lg" />}>
          <TrustedBrands />
        </Suspense>
        <section id="features" className="section-padding space-y-12 -mt-8" itemScope itemType="https://schema.org/ItemList">
          <meta itemProp="name" content="AI Fashion Photography Features" />
          <meta itemProp="description" content="Key features of Zarta's AI-powered fashion photography platform" />
          <header className="text-center mb-12">
            <h2 className="heading-2 mb-6" itemProp="name">AI Fashion Photography Features</h2>
            <p className="body-large max-w-3xl mx-auto" itemProp="description">
              Transform your e-commerce photography with AI-powered fashion photography tools. Generate professional product photography, lifestyle shots, and brand-consistent visuals in minutes.
            </p>
          </header>
          <FeatureSection
            title="Infinite Styles, Zero Photoshoots"
            description="Say goodbye to expensive, time-consuming photoshoots. Generate an endless variety of on-model images, lifestyle shots, and creative compositions in minutes. Our AI fashion photography platform creates professional product photography without the studio costs."
            imageUrl="/placeholder.svg?height=500&width=500"
            Icon={Infinity}
            benefit="Save Time & Money"
          />
          <FeatureSection
            title="Boost Engagement & Conversions"
            description="Capture your audience's attention with stunning, unique visuals that stand out. Brands using Zarta's AI fashion photography see an average 40% increase in click-through rates. Professional e-commerce photography that converts."
            imageUrl="/placeholder.svg?height=500&width=500"
            Icon={Zap}
            benefit="Increase Sales"
            reverse
          />
          <FeatureSection
            title="On-Brand, Every Time"
            description="Maintain perfect brand consistency with AI fashion photography. Our AI understands your aesthetic, generating images that align with your brand's mood, color palette, and style guidelines. Professional product photography that strengthens your brand identity."
            imageUrl="/placeholder.svg?height=500&width=500"
            Icon={CheckCircle}
            benefit="Strengthen Brand Identity"
          />
        </section>
        <Suspense fallback={<div className="h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <PricingSection />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <FaqSection />
        </Suspense>
        </article>
      </main>
      <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  )
}
