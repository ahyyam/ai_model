export const FB_PIXEL_ID: string = process.env.NEXT_PUBLIC_FB_PIXEL_ID || ""

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: any
  }
}

export function trackPageView(): void {
  if (typeof window === "undefined") return
  if (!window.fbq) return
  try {
    window.fbq("track", "PageView")
  } catch {
    // no-op
  }
}

export function trackEvent(event: string, data?: Record<string, any>): void {
  if (typeof window === "undefined") return
  if (!window.fbq) return
  try {
    window.fbq("track", event, data || {})
  } catch {
    // no-op
  }
}
