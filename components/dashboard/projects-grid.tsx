"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar, Lock, Search, Filter, SortAsc, SortDesc } from "lucide-react"
import Image from "next/image"
import { getProjectsForUser, type Project } from "@/lib/projects"
import { toast } from "@/hooks/use-toast"
import { getUserData, type UserData } from "@/lib/users"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { createUserData } from "@/lib/users"

export function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userDataError, setUserDataError] = useState(false)
  
  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Ensure user is properly authenticated
        try {
          // Get the current user's ID token to verify authentication
          const token = await firebaseUser.getIdToken()
          if (!token) {
            throw new Error("User not properly authenticated")
          }
          
          const userDataResult = await getUserData(firebaseUser.uid)
          if (userDataResult) {
            setUserData(userDataResult)
            setUserDataError(false)
          } else {
            // User data doesn't exist, create it
            try {
              const newUserData = await createUserData(firebaseUser)
              setUserData(newUserData)
              setUserDataError(false)
            } catch (createError) {
              console.error("Error creating user data:", createError)
              setUserDataError(true)
              // Set default user data to prevent errors
              setUserData({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                subscriptionStatus: 'free',
                credits: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUserDataError(true)
          // Set default user data to prevent errors
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            subscriptionStatus: 'free',
            credits: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      } else {
        setUserData(null)
        setUserDataError(false)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchProjects = async () => {
    if (!user) {
      setProjects([])
      return
    }
    try {
      // Prefer server fetch to avoid Firestore client rule issues
      const token = await user.getIdToken()
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        // Map server docs to client Project shape (minimal fields used in grid)
        const mapped: Project[] = (data || []).map((d: any) => ({
          id: d.id,
          userId: d.userId,
          name: d.name || (d.prompt ? String(d.prompt).slice(0, 64) : 'AI Photo Shoot'),
          createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt || '',
          updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || d.updatedAt || '',
          status: d.status,
          thumbnail: d.thumbnail || d.finalImageURL || d.garmentImage || '/placeholder.svg',
          aesthetic: d.aesthetic,
          downloads: d.downloads || 0,
          generatedImages: Array.isArray(d.generatedImages) ? d.generatedImages : (d.finalImageURL ? [d.finalImageURL] : []),
          garmentImage: d.garmentImage || d.garmentImageURL,
          referenceImage: d.referenceImage || d.referenceImageURL,
          finalImageURL: d.finalImageURL,
          prompt: d.prompt,
          aspect_ratio: d.aspect_ratio,
          version: d.version,
          versions: d.versions,
          error: d.error,
        }))
        setProjects(mapped)
        return
      }
    } catch (e) {
      console.error('Server projects fetch failed, falling back to client:', e)
    }

    // Fallback to client read if server route failed
    getProjectsForUser()
      .then(setProjects)
      .catch((error) => {
        console.error('Error fetching projects:', error)
        setProjects([])
      })
  }

  useEffect(() => {
    fetchProjects()
  }, [user])

  // Refresh projects when page becomes visible (e.g., returning from another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchProjects()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  // Function to refresh a specific project's data
  const refreshProject = async (projectId: string) => {
    try {
      const token = await user?.getIdToken()
      if (token) {
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const updatedProject = await response.json()
          setProjects(prevProjects => 
            prevProjects.map(p => 
              p.id === projectId ? { ...p, ...updatedProject } : p
            )
          )
        }
      }
    } catch (error) {
      console.error('Error refreshing project:', error)
    }
  }

  // Filtered and sorted projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.prompt && project.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // Status filter
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "downloads":
          aValue = a.downloads || 0
          bValue = b.downloads || 0
          break
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [projects, searchQuery, statusFilter, sortBy, sortOrder])

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "complete":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  // Default to not subscribed if there's an error or no user data
  const isSubscribed = userData?.subscriptionStatus === 'pro' || userData?.subscriptionStatus === 'elite'

  if (isLoading) {
    return (
      <div className="grid-zarta">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card-zarta aspect-square animate-pulse">
            <div className="w-full h-full bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Search, Filter, and Sort Controls */}
      <div className="space-y-4">
        {/* Integrated Search Bar with Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar with Status Filter */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects by name or prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-32 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
            />
            {/* Status Filter Dropdown */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 h-8 bg-gray-700/50 border-gray-600 text-white text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="downloads">Downloads</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
            >
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            {/* Clear Filters */}
            {(searchQuery !== "" || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                }}
                className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {filteredAndSortedProjects.length} of {projects.length} projects
          </div>
        </div>
      </div>

      {filteredAndSortedProjects.length === 0 ? (
        <div className="w-full text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="heading-3 mb-2 text-foreground">
              {projects.length === 0 ? "No projects yet" : "No projects match your filters"}
            </h3>
            <p className="text-muted mb-6">
              {projects.length === 0 
                ? ""
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {projects.length === 0 && !isSubscribed && (
              <Link href="/subscribe" className="btn-primary">
                Get Started
              </Link>
            )}
            {(searchQuery !== "" || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                }}
                className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid-zarta">
          {filteredAndSortedProjects.map((project) => (
            <Card
              key={project.id}
              className={`card-zarta-hover overflow-hidden group flex flex-col ${
                !isSubscribed 
                  ? 'hover:border-blue-500/50 hover:shadow-zarta cursor-pointer' 
                  : ''
              }`}
            >
              <Link href={`/projects/${project.id}`} className="block relative">
                <div className="relative aspect-square">
                  <Image src={(project.finalImageURL || project.thumbnail || "/placeholder.svg")} alt={project.name} fill className="object-cover" />

                  {project.status === "processing" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-white">Processing...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Subscription overlay for non-subscribed users */}
                  {!isSubscribed && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center p-4">
                        <Lock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-white font-semibold mb-1">Subscribe</p>
                        <p className="text-sm text-gray-300">Unlock unlimited generations and advanced features</p>
                        <Link 
                          href="/subscribe" 
                          className="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Subscribe Now
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-3 flex-grow flex flex-col">
                {/* Project name and status */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white truncate flex-1 mr-2">
                    {project.name}
                  </h3>
                  <Badge className={`text-xs flex-shrink-0 ${getStatusColor(project.status)}`}>{project.status}</Badge>
                </div>
                
                {/* Processing indicator */}
                {project.status === "processing" && (
                  <div className="mt-auto">
                    <Link href={`/generate`} className="text-xs text-blue-400 hover:underline">Resume generation</Link>
                  </div>
                )}
                
                {/* Date only */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  {project.status === "complete" && (
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {project.downloads}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Subscription reminder for non-subscribed users */}
      {!isSubscribed && projects.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Lock className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="heading-3 text-foreground mb-1">Unlock Premium Features</h3>
              <p className="text-muted">Get unlimited generations, priority processing, and advanced features</p>
            </div>
            <Link href="/subscribe" className="btn-primary flex-shrink-0">
              Subscribe Now
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
