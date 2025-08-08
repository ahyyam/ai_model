"use client"

export const dynamic = "force-dynamic"

import { TopNav } from "@/components/dashboard/top-nav"
import OnboardingFlow from "@/components/generate/onboarding-flow"

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <TopNav />
      <main className="container mx-auto px-4 md:px-6 py-8">
        <OnboardingFlow />
      </main>
    </div>
  )
}
