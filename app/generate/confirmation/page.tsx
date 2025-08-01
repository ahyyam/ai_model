"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"

export default function ConfirmationPage() {
  const router = useRouter()
  const [downloadingAll, setDownloadingAll] = useState(false)

  // Mock generated images - in real app, these would be the actual high-res results
  const generatedImages = Array(4).fill("/placeholder.svg?height=600&width=600")

  const handleDownloadAll = async () => {
    setDownloadingAll(true)

    // Simulate download process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setDownloadingAll(false)

    // Redirect to projects
    router.push("/projects")
  }

  const handleSingleDownload = async (index: number) => {
    // Simulate individual download
    console.log(`Downloading image ${index + 1}`)
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="font-sora text-3xl md:text-4xl font-bold">Payment Successful!</h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Your AI photoshoot is complete. Download your high-resolution images and start using them in your
              marketing campaigns.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-base"
            >
              {downloadingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Preparing Download...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download All Images
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/projects")}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent px-8 py-3 text-base"
            >
              Go to Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Generated Images Grid */}
          <Card className="bg-[#1c1c1c] border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Your High-Resolution Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((imgSrc, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative">
                      <Image
                        src={imgSrc || "/placeholder.svg"}
                        alt={`Generated image ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                      {/* Download overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Button
                          onClick={() => handleSingleDownload(index)}
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-center">Image {index + 1} • 4K Resolution</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-br from-[#1c1c1c] to-[#171717] border-gray-700/50 text-white mt-8">
            <CardContent className="p-6">
              <h3 className="font-sora text-lg font-semibold mb-4">What's Next?</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <p className="font-medium mb-1">Use in Marketing</p>
                  <p className="text-gray-400">Add to your website, social media, and ads</p>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <p className="font-medium mb-1">Create More</p>
                  <p className="text-gray-400">Generate unlimited variations with your subscription</p>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <p className="font-medium mb-1">Track Performance</p>
                  <p className="text-gray-400">Monitor your projects in the dashboard</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
