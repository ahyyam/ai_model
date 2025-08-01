"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getProjectById, type Project } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, Copy, Calendar, Tag, Info } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    if (params.id) {
      const projectId = Number.parseInt(params.id as string, 10)
      const foundProject = getProjectById(projectId)
      setProject(foundProject || null)
    }
  }, [params.id])

  const handleBack = () => {
    router.push("/projects")
  }

  const handleCopyPrompt = () => {
    if (project?.prompt) {
      navigator.clipboard.writeText(project.prompt)
      // Add a toast notification here in a real app
    }
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Projects</span>
          </Button>
          <h1 className="text-2xl font-bold text-white truncate font-sora">{project.name}</h1>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          Download Image
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Single Image */}
        <div className="lg:col-span-2">
          <Card className="bg-[#1c1c1c] border-gray-800 overflow-hidden">
            <div className="relative aspect-square w-full">
              <Image
                src={project.generatedImages?.[0] || "/placeholder.svg"}
                alt="Generated image"
                fill
                className="object-cover"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Project Details */}
        <div className="lg:sticky lg:top-24">
          <Card className="bg-[#1c1c1c] border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-blue-400" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Aesthetic
                  </span>
                  <span className="font-medium">{project.aesthetic}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Created
                  </span>
                  <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Prompt Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-400 text-sm">Prompt</h4>
                  <Button variant="ghost" size="icon" onClick={handleCopyPrompt} className="h-7 w-7">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">
                  {project.prompt || "No prompt provided."}
                </p>
              </div>

              {/* Input Images */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-400 text-sm">Input Images</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-500 text-center">Garment</h5>
                    <div className="relative aspect-square">
                      <Image
                        src={project.garmentImage || "/placeholder.svg"}
                        alt="Garment"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-500 text-center">Reference</h5>
                    <div className="relative aspect-square">
                      <Image
                        src={project.referenceImage || "/placeholder.svg"}
                        alt="Reference"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
