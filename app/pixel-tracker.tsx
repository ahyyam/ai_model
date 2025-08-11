"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { FB_PIXEL_ID, trackPageView } from "@/lib/analytics/pixel"

export default function PixelTracker(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!FB_PIXEL_ID) return
    // fire on initial load
    trackPageView()
  }, [])

  useEffect(() => {
    if (!FB_PIXEL_ID) return
    // fire on route change
    trackPageView()
  }, [pathname, searchParams])

  return null
}
