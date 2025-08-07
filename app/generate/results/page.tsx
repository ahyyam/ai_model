"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { addProject } from "@/lib/projects"
import { TopNav } from "@/components/dashboard/top-nav"

export default function ResultsPage() {
  const router = useRouter()
  const [garmentImage, setGarmentImage] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        router.replace("/login")
      }
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    // Try to get onboarding state from localStorage
    const onboardingState = localStorage.getItem("onboardingState")
    if (onboardingState) {
      const data = JSON.parse(onboardingState)
      setGarmentImage(data.garmentImage || null)
      setReferenceImage(data.referenceImage || null)
      setPrompt(data.prompt || "")
      setGeneratedImage(data.generatedImage || null)
    }
    // Optionally, fetch last project for logged-in users if needed
  }, [])

  const handleSaveProject = async () => {
    if (!user) return
    await addProject({
      name: prompt || "AI Photoshoot",
      status: "complete",
      aesthetic: "N/A",
      prompt,
      garmentImage: garmentImage || undefined,
      referenceImage: referenceImage || undefined,
      thumbnail: garmentImage || "/placeholder.svg?height=300&width=300",
      downloads: 0,
      generatedImages: [generatedImage || referenceImage || "/placeholder.svg?height=400&width=400"],
    })
    router.push("/projects")
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <TopNav />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Generated Result and Actions - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-start">
            {/* Left Column: Generated Result */}
            <div className="flex flex-col items-center lg:items-start">
              <Label className="text-lg font-semibold text-white mb-6">Generated Result</Label>
              <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-blue-900/10">
                <Image
                  src={generatedImage || "/placeholder.svg?height=800&width=800"}
                  alt="Your AI generated result"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Right Column: Action Buttons */}
            <div className="flex flex-col gap-6 items-center lg:items-start">
              <h3 className="text-xl font-semibold text-white">What would you like to do?</h3>
              
              {/* Garment and Reference Images - Side by Side */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">Your Garment</Label>
                  {garmentImage ? (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-800">
                      <Image
                        src={garmentImage}
                        alt="Uploaded garment"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 border border-gray-700 text-xs">
                      No garment
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">Your Reference</Label>
                  {referenceImage ? (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-800">
                      <Image
                        src={referenceImage}
                        alt="Reference style"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 border border-gray-700 text-xs">
                      No reference
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full max-w-md">
                <Button
                  onClick={handleSaveProject}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8"
                >
                  Download
                </Button>
                <Button
                  onClick={() => router.push("/projects")}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-400 hover:bg-blue-900/10 py-3 px-8"
                >
                  Go to Projects
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
