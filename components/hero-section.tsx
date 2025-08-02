import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Clock, Sparkles } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="pt-12 md:pt-20 pb-8 md:pb-16 relative" role="banner" aria-label="Main hero section" itemScope itemType="https://schema.org/Service">
      
      {/* SEO Meta Tags */}
      <meta itemProp="name" content="Instant AI Photoshoot Service - Professional Fashion Photography in Seconds" />
      <meta itemProp="description" content="Create professional fashion photography instantly with AI. Transform product photos into stunning visuals in seconds. No studio, no models, no waiting. Instant AI photoshoot service for e-commerce brands." />
      <meta itemProp="provider" content="Zarta" />
      <meta itemProp="serviceType" content="Instant AI Fashion Photography" />
      
      <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-3 md:mb-4 border border-blue-500/20">
            <Zap className="h-4 w-4" />
            <span>Instant AI Photoshoot in Seconds</span>
          </div>
          
          {/* Main Headline */}
          <header className="mb-4 md:mb-6">
            <h1 className="heading-1 mb-3 md:mb-4 leading-tight" itemProp="headline">
              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 lg:gap-6 mb-2">
                <span className="text-zarta-gradient">
                  Instant AI
                </span>
                <span className="text-blue-500">Photoshoot</span>
              </div>
              <div className="text-center">
                <span className="text-3xl md:text-4xl lg:text-5xl text-gray-300">
                  in Seconds
                </span>
              </div>
            </h1>
            
            {/* Subtitle */}
            <p className="max-w-3xl mx-auto body-large mb-3 md:mb-4" itemProp="description">
              Transform any product photo into <strong className="text-blue-400">professional fashion photography</strong> instantly. 
              No studio, no models, no waiting. <strong className="text-purple-400">AI-powered photoshoots in seconds</strong>.
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center items-center gap-4 mb-4 md:mb-6 text-sm md:text-base">
              <div className="flex items-center gap-2 text-green-400">
                <Clock className="h-4 w-4" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Sparkles className="h-4 w-4" />
                <span>Professional Quality</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <Zap className="h-4 w-4" />
                <span>95% Cost Savings</span>
              </div>
            </div>
          </header>
          
          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4 md:mb-6">
            <Button
              asChild
              size="lg"
              className="btn-primary text-lg px-10 py-6"
              aria-label="Start instant AI photoshoot"
            >
              <Link href="/generate" title="Start Instant AI Photoshoot - Professional Fashion Photography in Seconds">
                Start Instant Photoshoot <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="btn-secondary text-lg px-8 py-6"
            >
              Watch Demo
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-gray-900"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-gray-900"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <span>Trusted by 10,000+ brands</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
          </div>
        </div>
    </section>
  )
}
