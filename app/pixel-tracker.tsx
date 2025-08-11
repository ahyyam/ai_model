"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

declare global {
  interface Window {
    fbq: (...args: any[]) => void
  }
}

export default function PixelTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      // Track page view on route change
      window.fbq("track", "PageView")
    }
  }, [pathname, searchParams])

  return null
}
