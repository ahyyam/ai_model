"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { Menu, X, LayoutGrid, Settings, LifeBuoy, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { usePathname } from "next/navigation"

const navLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    await auth.signOut()
    localStorage.removeItem("onboardingState")
    window.location.href = "/"
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-[#111111]/80 backdrop-blur-lg border-b border-gray-800" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-bold font-sora">
            Modelix<span className="text-blue-500">.ai</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Only show avatar/dropdown if user is logged in and not on the landing page */}
            {user && pathname !== "/" ? (
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
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-gray-700/50 cursor-pointer">
                    <Link href="/billing">
                      <LayoutGrid className="mr-2 h-4 w-4" />
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
            ) : (
              <>
                <Button asChild variant="ghost" className="text-gray-300 hover:text-white">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <Link href="/generate">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-button p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-lg border-b border-gray-800 shadow-xl">
          <div className="container mx-auto px-4 py-6">
            {/* Navigation Links */}
            <nav className="space-y-4 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="block text-gray-300 hover:text-white transition-colors py-2 text-lg"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-700">
              {user && pathname !== "/" ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 py-3">
                    <Avatar className="h-10 w-10 border-2 border-blue-500">
                      <AvatarImage src={user?.photoURL || "/placeholder.svg?height=40&width=40&text=U"} alt="User Avatar" />
                      <AvatarFallback className="bg-gray-700">{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{user?.displayName || user?.email || "User"}</p>
                      <p className="text-xs text-gray-400">{user?.email || ""}</p>
                    </div>
                  </div>

                  {/* User Menu Items */}
                  <Link
                    href="/settings"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 py-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/billing"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 py-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <LayoutGrid className="h-5 w-5" />
                    <span>Billing</span>
                  </Link>
                  <Link
                    href="/support"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 py-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <LifeBuoy className="h-5 w-5" />
                    <span>Support</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      handleLinkClick()
                    }}
                    className="flex items-center space-x-3 py-3 text-red-400 hover:text-red-300 transition-colors w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <Link href="/login" onClick={handleLinkClick}>Log In</Link>
                  </Button>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Link href="/generate" onClick={handleLinkClick}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
