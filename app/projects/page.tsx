import { ProjectsGrid } from "@/components/dashboard/projects-grid"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Projects</h1>
      </div>
      <ProjectsGrid />
    </div>
  )
}
