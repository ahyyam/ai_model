"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditCard, LifeBuoy, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"

// Removed navLinks as they will no longer be displayed in the header for logged-in users

export function TopNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<FirebaseUser | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/projects" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo/logo.png" 
                alt="Zarta Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold font-sora text-white">Zarta</span>
          </Link>

          {/* Center: Simple Navigation Links - only show when logged in */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/projects"
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                  pathname === "/projects" || pathname.startsWith("/projects")
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Projects
              </Link>
              <Link
                href="/generate"
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                  pathname === "/generate" || pathname.startsWith("/generate")
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                New Project
              </Link>
            </nav>
          )}

          {/* Right: Profile Dropdown - only show when logged in */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-transparent hover:border-blue-500 transition-colors">
                    <AvatarImage src={user?.photoURL || "/placeholder.svg?height=40&width=40&text=U"} alt="User Avatar" />
                    <AvatarFallback className="bg-gray-700">{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#1c1c1c] border-gray-700 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || user?.email || "User"}</p>
                    <p className="text-xs leading-none text-gray-400">{user?.email || ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem asChild className="hover:bg-gray-700/50 cursor-pointer">
                  <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-gray-700/50 cursor-pointer">
                  <Link href="/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-gray-700/50 cursor-pointer">
                  <Link href="/support">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="hover:bg-red-500/20 cursor-pointer text-red-400 hover:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
