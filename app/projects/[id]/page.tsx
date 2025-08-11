"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getProjectById, deleteProject, type Project } from "@/lib/projects"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, Copy, Calendar, Tag, Info, Trash2 } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (params.id) {
      const projectId = params.id as string
      getProjectById(projectId).then(setProject).catch(error => {
        console.error("Error fetching project:", error)
        setProject(null)
      })
    }
  }, [params.id])

  const handleBack = () => {
    router.push("/projects")
  }

  const handleCopyPrompt = () => {
    if (project?.prompt) {
      navigator.clipboard.writeText(project.prompt)
      toast({ title: "Prompt copied to clipboard" })
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    
    try {
      await deleteProject(project.id)
      toast({ title: "Project deleted successfully" })
      router.push("/projects")
    } catch (error: any) {
      console.error("Error deleting project:", error)
      toast({ 
        title: "Failed to delete project", 
        description: error?.message || "Try again later." 
      })
    }
  }

  const handleDownloadImage = async () => {
    if (!project?.finalImageURL) {
      toast({ title: "No image available to download" })
      return
    }

    setIsDownloading(true)
    try {
      // Use the download API endpoint to handle CORS and authentication
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: project.finalImageURL }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Download failed: ${response.status}`)
      }

      // Get the blob from the response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `zarta-project-${project.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Update the downloads count locally
      if (project) {
        setProject({
          ...project,
          downloads: (project.downloads || 0) + 1
        })
      }
      
      // Also update the downloads count in the database
      try {
        const token = await auth.currentUser?.getIdToken()
        if (token) {
          await fetch(`/api/projects/${project.id}/download`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        }
      } catch (error) {
        console.error('Failed to update download count:', error)
      }
      
      toast({ title: "Image downloaded successfully" })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({ 
        title: "Failed to download image", 
        description: error instanceof Error ? error.message : "Try again later." 
      })
    } finally {
      setIsDownloading(false)
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
    <div className="container-zarta py-16 space-y-8">
      {/* Header */}
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

      {/* Generated Image */}
      <div className="flex flex-col items-center">
        <Card className="card-zarta overflow-hidden w-full max-w-2xl">
          <div className="relative aspect-square w-full">
            <Image
              src={project.finalImageURL || project.thumbnail || "/placeholder.svg"}
              alt="Generated image"
              fill
              className="object-cover"
            />
          </div>
        </Card>
      </div>

      {/* Project Details */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Basic Info */}
        <div className="flex justify-center">
          <div className="flex justify-between items-center p-6 bg-gray-900/50 border border-gray-700 rounded-xl min-w-[280px]">
            <span className="text-gray-300 flex items-center gap-3 text-base font-medium">
              <Calendar className="h-5 w-5" /> Created at
            </span>
            <span className="text-white text-base font-semibold">{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Prompt Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">AI Generated Prompt</h3>
            <Button variant="ghost" size="icon" onClick={handleCopyPrompt} className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-300 leading-relaxed">
              {project.prompt || "No prompt provided."}
            </p>
          </div>
        </div>

        {/* Input Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Input Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400 text-center">Your Garment</h4>
              <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-800">
                <Image
                  src={project.garmentImage || "/placeholder.svg"}
                  alt="Garment"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400 text-center">Your Reference</h4>
              <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-800">
                <Image
                  src={project.referenceImage || "/placeholder.svg"}
                  alt="Reference"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Now under project details */}
      <div className="flex flex-col items-center pt-8">
        <h3 className="text-xl font-semibold text-white mb-6">What would you like to do?</h3>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button 
            className="btn-primary flex-1"
            onClick={handleDownloadImage}
            disabled={!project?.finalImageURL || isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </>
            )}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="btn-destructive flex-1">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#121212] border-gray-800 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete project?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This will permanently delete this project and all its images. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteProject}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
