"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, UploadCloud, Scan, Sparkles, CheckCircle } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"

const steps = [
  {
    icon: <UploadCloud className="h-8 w-8 text-blue-400" />,
    title: "Upload Your Garment",
    description: "Upload your clothing item on a plain background. We'll transform it into professional fashion photography.",
    color: "from-blue-500/10 to-blue-600/10"
  },
  {
    icon: <Scan className="h-8 w-8 text-purple-400" />,
    title: "Add Model & Style Reference",
    description: "Add your model photo and style inspiration for the look you want to achieve.",
    color: "from-purple-500/10 to-purple-600/10"
  },
  {
    icon: <Sparkles className="h-8 w-8 text-emerald-400" />,
    title: "Generate & Customize",
    description: "Get hyper-realistic AI fashion images and customize them to match your brand perfectly.",
    color: "from-emerald-500/10 to-emerald-600/10"
  }
]

export default function GetStartedPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep === 1) {
      // Step 2: Navigate directly to signup
      router.push("/signup")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1))
  }

  const handleSkipToSignup = () => {
    router.push("/signup")
  }

  return (
    <div className="bg-[#111111] text-white min-h-screen">
      <Header />
      
      <main className="container-zarta py-12 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-10 space-md">
          <h1 className="heading-3">Get Started with Zarta</h1>
          <p className="text-body text-gray-400 max-w-2xl mx-auto">
            Transform your fashion photography in three simple steps. No camera, no crew, just AI-powered magic.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-body-sm font-medium text-gray-400">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-body-sm font-medium text-blue-400">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className={`bg-gradient-to-br ${steps[currentStep].color} rounded-xl border border-gray-700/50 p-6 md:p-8`}>
            <div className="text-center mb-8 space-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-xl mb-6">
                {steps[currentStep].icon}
              </div>
              <h2 className="heading-4">
                {steps[currentStep].title}
              </h2>
              <p className="text-body-sm text-gray-300 max-w-2xl mx-auto">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Step Preview */}
            <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-6 mb-8 text-center">
              <div className="text-muted font-medium">
                Step {currentStep + 1} Preview
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between max-w-sm mx-auto">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 0
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-medium"
              >
                {currentStep === 1 ? "Create Account" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={handleSkipToSignup}
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium underline decoration-gray-600 hover:decoration-white"
            >
              Skip to signup
            </button>
          </div>
        </div>

        {/* Step Overview */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-lg border transition-all duration-200 ${
                  index === currentStep
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-gray-700/50 bg-gray-800/30"
                }`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 ${
                  index === currentStep ? "bg-blue-500/20" : "bg-gray-700/50"
                }`}>
                  {step.icon}
                </div>
                <h3 className="heading-4 mb-2">{step.title}</h3>
                <p className="text-body-sm text-gray-400 leading-relaxed">{step.description}</p>
                {index <= currentStep && (
                  <div className="mt-4">
                    <CheckCircle className="h-4 w-4 text-blue-400 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
