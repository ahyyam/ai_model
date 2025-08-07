"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth"
import { createUserData } from "@/lib/users"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Create user document in Firestore
      if (result.user) {
        try {
          console.log("Attempting to create user data for:", result.user.uid)
          await createUserData(result.user)
          console.log("User data created successfully during signup")
        } catch (createError) {
          console.error("Error creating user data during signup:", createError)
          // Continue anyway, user data will be created when they visit other pages
        }
      }
      
      // Check for onboarding state
      const onboardingState = localStorage.getItem("onboardingState")
      if (onboardingState) {
        localStorage.removeItem("onboardingState")
        router.push("/generate/results")
        return
      }
      // Redirect to subscription page for new users
      router.push("/subscribe")
    } catch (err: any) {
      setError(err.message || "Google sign-up failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }
    
    setIsLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document in Firestore
      if (result.user) {
        try {
          console.log("Attempting to create user data for:", result.user.uid)
          await createUserData(result.user)
          console.log("User data created successfully during signup")
        } catch (createError) {
          console.error("Error creating user data during signup:", createError)
          // Continue anyway, user data will be created when they visit other pages
        }
      }
      
      // Check for onboarding state
      const onboardingState = localStorage.getItem("onboardingState")
      if (onboardingState) {
        localStorage.removeItem("onboardingState")
        router.push("/generate/results")
        return
      }
      // Redirect to subscription page for new users
      router.push("/subscribe")
    } catch (err: any) {
      setError(err.message || "Sign up failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">
      <div className="w-full max-w-md p-8 bg-[#1c1c1c] rounded-2xl border border-gray-800 shadow-lg">
        {/* Back to Login Link */}
        <div className="mb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden mb-4">
            <img 
              src="/logo/logo.png" 
              alt="Zarta Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-sora text-3xl font-bold mb-2 text-center">Create your account</h1>
          <p className="text-gray-400 text-center">Join Zarta to start creating amazing AI photoshoots</p>
        </div>
        
        <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-[#222] border-gray-700 text-white placeholder-gray-400"
            autoComplete="email"
            required
          />
          
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-[#222] border-gray-700 text-white placeholder-gray-400 pr-12"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg p-1"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="bg-[#222] border-gray-700 text-white placeholder-gray-400 pr-12"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg p-1"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-700" />
          <span className="mx-4 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-700" />
        </div>
        
        <Button
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-6 text-base flex items-center justify-center"
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {isLoading ? "Creating account..." : "Sign up with Google"}
        </Button>
        
        <div className="flex justify-center items-center mt-6">
          <span className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
} 