"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Lock, Sparkles, Star } from "lucide-react"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { addProject } from "@/lib/projects"

const trustedBrands = [
  { name: "BrandA", logo: "/placeholder.svg?height=40&width=100&text=BrandA" },
  { name: "BrandB", logo: "/placeholder.svg?height=40&width=100&text=BrandB" },
  { name: "BrandC", logo: "/placeholder.svg?height=40&width=100&text=BrandC" },
  { name: "BrandD", logo: "/placeholder.svg?height=40&width=100&text=BrandD" },
]

export default function ResultsPage() {
  const router = useRouter()
  const [garmentImage, setGarmentImage] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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

  const handleEditPrompt = async () => {
    setIsLoading(true)
    // Simulate re-generation (replace with real API call if needed)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGeneratedImage("/placeholder.svg?height=800&width=800&prompt=" + encodeURIComponent(prompt))
    setIsLoading(false)
  }

  const handleSaveProject = async () => {
    if (!user) return
    await addProject({
      name: prompt || "AI Photoshoot",
      status: "completed",
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
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Left Column: Visual Result & Proof */}
          <div className="space-y-8 lg:sticky lg:top-8">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-blue-900/10">
              <Image
                src={generatedImage || "/placeholder.svg?height=800&width=800"}
                alt="Your AI generated result"
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-400 ml-1">Your Garment</Label>
                {garmentImage ? (
                  <Image
                    src={garmentImage}
                    alt="Uploaded garment"
                    width={300}
                    height={300}
                    className="rounded-lg object-cover aspect-square border border-gray-800"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">No garment image</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400 ml-1">Your Reference</Label>
                {referenceImage ? (
                  <Image
                    src={referenceImage}
                    alt="Reference style"
                    width={300}
                    height={300}
                    className="rounded-lg object-cover aspect-square border border-gray-800"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">No reference image</div>
                )}
              </div>
            </div>
          </div>
          {/* Right Column: Prompt Editing & Actions */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
            <Card className="bg-[#1c1c1c] border-gray-800 text-white rounded-2xl">
              <CardHeader>
                <CardTitle className="font-sora text-3xl font-bold">Edit Prompt & Regenerate</CardTitle>
                <p className="text-gray-400 pt-1">Change your prompt and generate a new result.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Label htmlFor="prompt">Prompt</Label>
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 h-12"
                  placeholder="Describe your desired style..."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleEditPrompt}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
                  >
                    {isLoading ? "Generating..." : "Regenerate"}
                  </Button>
                  <Button
                    onClick={handleSaveProject}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-base"
                  >
                    Save
                  </Button>
                </div>
                <Button
                  onClick={() => router.push("/projects")}
                  variant="outline"
                  className="w-full mt-2 border-blue-600 text-blue-400 hover:bg-blue-900/10"
                >
                  Go to Projects
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
