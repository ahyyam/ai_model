// Performance optimization utilities

// Debounce function for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Intersection Observer hook for lazy loading
export function createIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  return new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, options)
}

// Preload critical resources
export function preloadResource(href: string, as: string = 'image') {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Optimize images with lazy loading
export function optimizeImage(src: string, alt: string, className: string = '') {
  return {
    src,
    alt,
    className,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  }
}

// Cache management
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private maxAge: number

  constructor(maxAge: number = 5 * 60 * 1000) { // 5 minutes default
    this.maxAge = maxAge
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  clear(): void {
    this.cache.clear()
  }
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start}ms`)
}

// Optimize scroll events
export const optimizedScrollHandler = throttle((callback: () => void) => {
  callback()
}, 16) // ~60fps

// Optimize resize events
export const optimizedResizeHandler = debounce((callback: () => void) => {
  callback()
}, 250) 