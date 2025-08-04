"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Calendar, Crown, Lock } from "lucide-react"
import Image from "next/image"
import { getProjectsForUser, type Project } from "@/lib/projects"
import { getUserData, type UserData } from "@/lib/users"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"

export function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userDataError, setUserDataError] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          const userDataResult = await getUserData(firebaseUser.uid)
          setUserData(userDataResult)
          setUserDataError(false)
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUserDataError(true)
          // Set default user data to prevent errors
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            subscriptionStatus: 'free',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      getProjectsForUser().then(setProjects).catch(error => {
        console.error("Error fetching projects:", error)
        setProjects([])
      })
    }
  }, [user])

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  // Default to not subscribed if there's an error or no user data
  const isSubscribed = userData?.subscriptionStatus === 'pro' || userData?.subscriptionStatus === 'enterprise'

  if (isLoading) {
    return (
      <div className="w-full text-center text-gray-400 py-16 text-lg">
        Loading projects...
      </div>
    )
  }

  return (
    <>
      {projects.length === 0 ? (
        <div className="w-full text-center text-gray-400 py-16 text-lg">
          <p className="mb-4">No projects yet.</p>
          {!isSubscribed && (
            <Link 
              href="/subscribe" 
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`bg-[#1c1c1c] border-gray-800 text-white overflow-hidden group transition-all duration-300 flex flex-col ${
                !isSubscribed 
                  ? 'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer' 
                  : 'hover:border-gray-600'
              }`}
            >
              <Link href={`/projects/${project.id}`} className="block relative">
                <div className="relative aspect-square">
                  <Image src={project.thumbnail || "/placeholder.svg"} alt={project.name} fill className="object-cover" />
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
                        <p className="text-white font-semibold mb-1">Upgrade to Pro</p>
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
              <CardContent className="p-4 flex-grow flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm truncate flex-1 pr-2">{project.name}</h3>
                  <div className="flex items-center gap-2">
                    {isSubscribed && (
                      <Crown className="h-3 w-3 text-yellow-400" />
                    )}
                    <Badge className={`text-xs ${getStatusColor(project.status)}`}>{project.status}</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-2 flex-grow">{project.aesthetic}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  {project.status === "completed" && (
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
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-blue-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-white">Upgrade to Pro</h3>
              <p className="text-sm text-gray-300">Get unlimited generations, priority processing, and advanced features</p>
            </div>
            <Link 
              href="/subscribe" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
