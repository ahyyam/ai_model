"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth"
import { createUserData, getUserData } from "@/lib/users"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState("")

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Ensure user document exists in Firestore
      if (result.user) {
        try {
          const existingUserData = await getUserData(result.user.uid)
          if (!existingUserData) {
            await createUserData(result.user)
          }
        } catch (createError) {
          console.error("Error creating user data:", createError)
          // Continue anyway
        }
      }
      
      // Check for onboarding state
      const onboardingState = localStorage.getItem("onboardingState")
      if (onboardingState) {
        localStorage.removeItem("onboardingState")
        router.push("/generate/results")
        return
      }
      router.push("/projects")
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }
    setIsLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // Ensure user document exists in Firestore
      if (result.user) {
        try {
          const existingUserData = await getUserData(result.user.uid)
          if (!existingUserData) {
            await createUserData(result.user)
          }
        } catch (createError) {
          console.error("Error creating user data:", createError)
          // Continue anyway
        }
      }
      
      // Check for onboarding state
      const onboardingState = localStorage.getItem("onboardingState")
      if (onboardingState) {
        localStorage.removeItem("onboardingState")
        router.push("/generate/results")
        return
      }
      router.push("/projects")
    } catch (err: any) {
      setError(err.message || "Email sign-in failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMessage("")
    if (!resetEmail) {
      setResetMessage("Please enter your email.")
      return
    }
    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setResetMessage("Password reset email sent! Check your inbox.")
    } catch (err: any) {
      setResetMessage(err.message || "Failed to send reset email.")
    } finally {
      setIsLoading(false)
    }
  }



  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">
        <div className="w-full max-w-md p-8 bg-[#1c1c1c] rounded-2xl border border-gray-800 shadow-lg">
          <h1 className="font-sora text-2xl font-bold mb-6 text-center">Reset your password</h1>
          <form onSubmit={handleForgotPassword} className="space-y-4 mb-6">
            <Input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              className="bg-[#222] border-gray-700 text-white placeholder-gray-400"
              autoComplete="email"
              required
            />
            {resetMessage && <div className={`text-sm ${resetMessage.includes('sent') ? 'text-green-500' : 'text-red-500'}`}>{resetMessage}</div>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
            >
              {isLoading ? "Sending..." : "Send reset email"}
            </Button>
          </form>
          <Button variant="ghost" className="w-full" onClick={() => setShowReset(false)}>
            Back to login
          </Button>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">
      <div className="w-full max-w-md p-8 bg-[#1c1c1c] rounded-2xl border border-gray-800 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden mb-4">
            <img 
              src="/logo/logo.png" 
              alt="Zarta Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-sora text-3xl font-bold text-center">Sign in to Zarta</h1>
        </div>
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-2">
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
              autoComplete="current-password"
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
          <div className="flex justify-center mb-2">
            <button
              type="button"
              className="text-blue-400 hover:underline text-sm"
              onClick={() => setShowReset(true)}
            >
              Forgot password?
            </button>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
          >
            {isLoading ? "Signing in..." : "Sign in with Email"}
          </Button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-700" />
          <span className="mx-4 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-700" />
        </div>
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-6 text-base flex items-center justify-center"
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>
        <div className="flex justify-center items-center mt-6">
          <span className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
} 