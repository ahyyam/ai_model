import { ProjectsGrid } from "@/components/dashboard/projects-grid"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Projects</h1>
      </div>
      <ProjectsGrid />
      
      {/* Floating Plus Button - Mobile Only */}
      <Link 
        href="/generate" 
        className="fixed bottom-6 right-6 md:hidden z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Create new project"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}
