"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import HowItWorks from "@/components/how-it-works"
import FeatureSection from "@/components/feature-section"
import PricingSection from "@/components/pricing-section"
import FaqSection from "@/components/faq-section"
import Footer from "@/components/footer"
import TrustedBrands from "@/components/trusted-brands"
import TestimonialsSection from "@/components/testimonials-section"
import { CheckCircle, Zap, Infinity } from "lucide-react"
import StructuredData, { OrganizationData, WebsiteData, ProductData } from "@/components/seo/structured-data"

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
      <HeroSection />
      <main className="container-zarta" role="main">
        <article itemScope itemType="https://schema.org/Article">
          <meta itemProp="headline" content="AI-Powered Fashion Photography | Transform Product Photos Instantly" />
          <meta itemProp="description" content="Transform plain clothing product photos into styled, high-quality, scroll-stopping visuals using AI. Save 95% on photoshoot costs with instant professional fashion photography for e-commerce brands." />
          <meta itemProp="author" content="Zarta Team" />
          <meta itemProp="publisher" content="Zarta" />
          <meta itemProp="datePublished" content="2024-01-01" />
          <meta itemProp="dateModified" content={new Date().toISOString().split('T')[0]} />
        <HowItWorks />
        <TrustedBrands />
        <section id="features" className="section-zarta space-y-8 -mt-8" itemScope itemType="https://schema.org/ItemList">
          <meta itemProp="name" content="AI Fashion Photography Features" />
          <meta itemProp="description" content="Key features of Zarta's AI-powered fashion photography platform" />
          <header className="text-center mb-12">
            <h2 className="heading-2 mb-8" itemProp="name">AI Fashion Photography Features</h2>
          </header>
          <FeatureSection
            title="Unlimited Looks. No Photoshoot Required."
            description="Create endless, professional model shots in minutes. No camera, no crew, no studio rental. From simple garment upload to stunning visuals, Zarta AI handles everything at a fraction of traditional photoshoot costs."
            imageUrl="/images/feature-1.png"
            Icon={Infinity}
            benefit="Save Time & Money"
          />
          <FeatureSection
            title="Boost Sales With Compelling Visuals"
            description="Eye-catching product images directly impact your conversion rates. Zarta AI-generated content is scientifically designed to drive clicks, engagement, and sales for your e-commerce business."
            imageUrl="/images/feature-2.png"
            Icon={Zap}
            benefit="Increase Conversions"
            reverse
          />
        </section>
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        </article>
      </main>
      <Footer />
    </div>
  )
}
