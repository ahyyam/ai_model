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
    <div className="bg-[#111111] text-white min-h-screen" itemScope itemType="https://schema.org/WebPage">
      {/* SEO Structured Data */}
      <StructuredData type="organization" data={OrganizationData} />
      <StructuredData type="website" data={WebsiteData} />
      <StructuredData type="product" data={ProductData} />
      
      <Header />
      <main className="container-zarta" role="main">
        <article itemScope itemType="https://schema.org/Article">
          <meta itemProp="headline" content="AI-Powered Fashion Photography | Transform Product Photos" />
          <meta itemProp="description" content="Transform plain clothing product photos into styled, high-quality, scroll-stopping visuals using AI. Save 95% on photoshoot costs with instant professional fashion photography for e-commerce brands." />
          <meta itemProp="author" content="Zarta Team" />
          <meta itemProp="publisher" content="Zarta" />
          <meta itemProp="datePublished" content="2024-01-01" />
          <meta itemProp="dateModified" content={new Date().toISOString().split('T')[0]} />
        <HeroSection />
        <HowItWorks />
        <Suspense fallback={<div className="h-24 sm:h-32 bg-gray-800 animate-pulse rounded-lg" />}>
          <TrustedBrands />
        </Suspense>
        <section id="features" className="section-zarta space-y-8 -mt-8" itemScope itemType="https://schema.org/ItemList">
          <meta itemProp="name" content="AI Fashion Photography Features" />
          <meta itemProp="description" content="Key features of Zarta's AI-powered fashion photography platform" />
          <header className="text-center mb-12">
            <h2 className="heading-2 mb-6" itemProp="name">AI Fashion Photography Features</h2>
          </header>
          <FeatureSection
            title="Unlimited Looks. No Photoshoot Needed."
            description="Create endless, professional model shots in minutes No camera, no crew. From simple garment upload to professional visuals, Zarta AI handles it all at a fraction of the time and cost."
            imageUrl="/images/feature-1.png"
            Icon={Infinity}
            benefit="Save Time & Money"
          />
          <FeatureSection
            title="Sell More With Better Visuals"
            description="Eye-catching images directly impact your sales. Zarta AI-generated content is designed to drive clicks, interactions, and conversions."
            imageUrl="/images/feature-2.png"
            Icon={Zap}
            benefit="Increase Sales"
            reverse
          />
        </section>
        <Suspense fallback={<div className="h-64 sm:h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 sm:h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <PricingSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 sm:h-96 bg-gray-800 animate-pulse rounded-lg" />}>
          <FaqSection />
        </Suspense>
        </article>
      </main>
      <Suspense fallback={<div className="h-48 sm:h-64 bg-gray-800 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  )
}
