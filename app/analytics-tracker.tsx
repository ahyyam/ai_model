"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      // Track page view on route change
      window.gtag("config", "G-810HSMQQJB", {
        page_path: pathname + searchParams.toString(),
        page_title: document.title,
      })
    }
  }, [pathname, searchParams])

  return null
}
