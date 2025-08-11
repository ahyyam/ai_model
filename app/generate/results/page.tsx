"use client"

export const dynamic = "force-dynamic"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
// import { addProject } from "@/lib/projects"
import { TopNav } from "@/components/dashboard/top-nav"

export default function ResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [garmentImage, setGarmentImage] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false)

  // Function to check for active generations in user's projects
  const checkForActiveGenerations = async () => {
    if (!user) return null
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const projects = await response.json()
        const activeProject = projects.find((p: any) => p.status === 'processing')
        return activeProject
      }
    } catch (error) {
      console.error('Error checking for active projects:', error)
    }
    return null
  }

  // Function to poll for generation results
  const startPollingForResults = async () => {
    if (!user) return
    
    try {
      // Get the current generation ID from localStorage
      const onboardingState = localStorage.getItem("onboardingState")
      if (!onboardingState) return
      
      const data = JSON.parse(onboardingState)
      if (!data.projectId) {
        // If no generation ID, try to find active generation from user's projects
        console.log("No generation ID found, checking for active projects...")
        const activeProject = await checkForActiveGenerations()
        if (activeProject) {
          // Update localStorage with the active project info
          const updatedState = {
            ...data,
            projectId: activeProject.id,
            prompt: activeProject.prompt || data.prompt
          }
          localStorage.setItem("onboardingState", JSON.stringify(updatedState))
          
          // Start polling with the found generation ID
          setProjectId(activeProject.id)
          startPollingWithProject(activeProject.id)
        }
        return
      }
      
      setProjectId(data.projectId)
      startPollingWithProject(data.projectId)
    } catch (error) {
      console.error("Error starting polling:", error)
    }
  }

  // Separate function to start polling with a specific generation ID
  const startPollingWithProject = (projId: string) => {
    if (!user) return
    
    // Start polling
    const pollInterval = setInterval(async () => {
      try {
        const token = await user.getIdToken()
        const response = await fetch('/api/generate/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ projectId: projId })
        })
        
        if (response.ok) {
          const result = await response.json()
          
          if (result.status === 'complete' && result.finalImageURL) {
            // Generation completed successfully
            const imageUrl = result.finalImageURL
            setGeneratedImage(imageUrl)
            setIsGenerating(false)
            
            // Fetch the full project data to get the prompt
            try {
              const projectResponse = await fetch(`/api/projects/${projId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              
              if (projectResponse.ok) {
                const projectData = await projectResponse.json()
                if (projectData.prompt) {
                  setPrompt(projectData.prompt)
                  console.log("Prompt loaded from project:", projectData.prompt)
                }
              }
            } catch (error) {
              console.error("Error fetching project data:", error)
            }
            
            // Update localStorage with the result
            const onboardingState = localStorage.getItem("onboardingState")
            if (onboardingState) {
              const data = JSON.parse(onboardingState)
              const updatedState = {
                ...data,
                generatedImage: imageUrl,
                isGenerating: false
              }
              localStorage.setItem("onboardingState", JSON.stringify(updatedState))
            }
            
            // Clear the polling interval
            clearInterval(pollInterval)
            
            console.log("Generation completed successfully:", imageUrl)
          } else if (result.status === 'error') {
            // Generation failed
            setIsGenerating(false)
            clearInterval(pollInterval)
            console.error("Generation failed:", result)
          }
          // If still processing, continue polling
        } else {
          console.error("Failed to check generation status:", response.status)
        }
      } catch (error) {
        console.error("Error checking generation status:", error)
      }
    }, 2000) // Poll every 2 seconds
    
    // Cleanup function
    return () => clearInterval(pollInterval)
  }

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
    // Check for current generation state first
    const onboardingState = localStorage.getItem("onboardingState")
    if (onboardingState) {
      const data = JSON.parse(onboardingState)
      setGarmentImage(data.garmentImage || null)
      setReferenceImage(data.referenceImage || null)
      setPrompt(data.prompt || "")
      setGeneratedImage(data.generatedImage || null)
      setIsGenerating(data.isGenerating || false)
      
      // If we're generating, start polling for results
      if (data.isGenerating) {
        startPollingForResults()
      } else if (data.projectId && !data.prompt) {
        // If we have a project ID but no prompt, try to fetch it
        fetchProjectPrompt(data.projectId)
      }
    } else {
      // Fallback to last generated project if no current generation
      const lastGeneratedProject = localStorage.getItem("lastGeneratedProject")
      if (lastGeneratedProject) {
        const data = JSON.parse(lastGeneratedProject)
        setGarmentImage(data.garmentImage || null)
        setReferenceImage(data.referenceImage || null)
        setPrompt(data.prompt || "")
        setGeneratedImage(data.generatedImages?.[0] || null)
        setIsGenerating(false)
      }
    }
  }, [])

  // Function to fetch project prompt
  const fetchProjectPrompt = async (projId: string) => {
    if (!user) return
    
    setIsLoadingPrompt(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch(`/api/projects/${projId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const projectData = await response.json()
        if (projectData.prompt) {
          setPrompt(projectData.prompt)
          console.log("Prompt loaded from project:", projectData.prompt)
        }
      }
    } catch (error) {
      console.error("Error fetching project prompt:", error)
    } finally {
      setIsLoadingPrompt(false)
    }
  }

  const handleDownloadImage = async () => {
    if (!generatedImage) {
      console.error("No generated image to download")
      return
    }

    try {
      const resp = await fetch('/api/download-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: generatedImage }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.error || `Failed: ${resp.status}`)
      }
      const blob = await resp.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `zarta-image-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Download failed:", error)
      
      alert("Failed to download image. Please try again.")
    }
  }

  // Skip client auto-save. The server creates and updates the project document.

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <TopNav />
      <main className="container-zarta py-16">
        <div className="max-w-4xl mx-auto">
          {/* Generated Result */}
          <div className="flex flex-col items-center mb-12">
            <Label className="text-lg font-semibold text-white mb-6">Generated Result</Label>
            <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-blue-900/10">
              {isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/50">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mb-4"></div>
                  <div className="text-center">
                    <div className="text-blue-400 text-lg font-semibold mb-2">Generating...</div>
                    <div className="text-gray-400 text-sm">Creating your AI fashion photography</div>
                  </div>
                </div>
              ) : (
                <Image
                  src={generatedImage || "/placeholder.svg?height=800&width=800"}
                  alt="Your AI generated result"
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
          
          {/* Project Details */}
          <div className="space-y-8 mb-12">
            {/* AI Generated Prompt */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-white">AI Generated Prompt</Label>
                {prompt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(prompt)
                      toast({
                        title: "Prompt copied!",
                        description: "Your AI generated prompt has been copied to your clipboard.",
                      })
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Copy Prompt
                  </Button>
                )}
              </div>
              
              {isLoadingPrompt ? (
                <div className="p-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-3"></div>
                    <span className="text-gray-400">Loading prompt...</span>
                  </div>
                </div>
              ) : prompt ? (
                <div className="p-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-200 leading-relaxed font-mono">{prompt}</p>
                    
                    {/* Quick styling breakdown */}
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {prompt.includes('studio-lighting') && (
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full border border-blue-700/50">
                            Studio Lighting
                          </span>
                        )}
                        {prompt.includes('outdoor') && (
                          <span className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded-full border border-green-700/50">
                            Outdoor Setting
                          </span>
                        )}
                        {prompt.includes('natural-daylight') && (
                          <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded-full border border-yellow-700/50">
                            Natural Light
                          </span>
                        )}
                        {prompt.includes('standing') && (
                          <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-700/50">
                            Standing Pose
                          </span>
                        )}
                        {prompt.includes('sitting') && (
                          <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-700/50">
                            Sitting Pose
                          </span>
                        )}
                        {prompt.includes('walking') && (
                          <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-700/50">
                            Walking Pose
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700 rounded-xl">
                  <p className="text-sm text-gray-500 text-center">No prompt available yet</p>
                </div>
              )}
              
              {prompt && (
                <p className="text-xs text-gray-500 text-center">
                  This prompt was automatically generated by AI to create your fashion photography
                </p>
              )}
            </div>
            
            {/* Garment and Reference Images - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
          
          {/* Action Buttons - Now under project details */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold text-white mb-6">What would you like to do?</h3>
            <div className="flex flex-col gap-3 w-full max-w-md">
                              <Button
                  onClick={handleDownloadImage}
                  disabled={!generatedImage}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Download Image
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
