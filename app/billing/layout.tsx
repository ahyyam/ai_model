import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/dashboard/top-nav"
import Footer from "@/components/footer"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="flex min-h-screen flex-col bg-[#111111] text-white">
        <TopNav />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">{children}</main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
