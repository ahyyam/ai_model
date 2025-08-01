"use client"

import { ArrowRight, Sparkles, Zap } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50) // 50% = middle
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    updateSliderPosition(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      updateSliderPosition(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const position = ((clientX - rect.left) / rect.width) * 100
    const clampedPosition = Math.max(0, Math.min(100, position))
    setSliderPosition(clampedPosition)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove as any)
      document.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove as any)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging])

  return (
    <section id="before-after" className="py-20 md:py-32 bg-gradient-to-b from-[#111111] to-[#0a0a0a]">
      <div className="text-center max-w-4xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-blue-400" />
          <h2 className="font-sora text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            From Plain to Premium
          </h2>
          <Zap className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-gray-300 text-lg md:text-xl mb-6 max-w-2xl mx-auto">
          Watch ordinary product photos transform into stunning, scroll-stopping visuals in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Before: Basic product shot</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>After: Premium lifestyle image</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative group">
          {/* Before/After Labels */}
          <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-gray-600">
            Before
          </div>
          <div className="absolute top-4 right-4 z-10 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-blue-400">
            After
          </div>
          
          {/* Curtain Slider */}
          <div 
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden border-2 border-gray-700 shadow-2xl group-hover:border-blue-500/50 transition-all duration-300 cursor-ew-resize"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative h-[500px] w-full">
              {/* Before Image (Base Layer) */}
              <div className="absolute inset-0">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👕</div>
                    <div className="text-gray-600 font-medium text-lg">Plain Product Shot</div>
                    <div className="text-gray-500 text-sm mt-2">Basic white background</div>
                  </div>
                </div>
              </div>
              
              {/* After Image (Overlay Layer) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✨</div>
                    <div className="text-white font-medium text-lg">Premium Lifestyle Image</div>
                    <div className="text-blue-200 text-sm mt-2">Styled with model & background</div>
                  </div>
                </div>
              </div>
              
              {/* Slider Handle */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 z-30 cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="bg-white rounded-full p-3 shadow-xl border-2 border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-110">
                  <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                </div>
                {/* Pulse animation for better visibility */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
              </div>
              
              {/* Divider Line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-blue-500 z-10"
                style={{ left: `${sliderPosition}%` }}
              ></div>
            </div>
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
        </div>
        
        {/* Interactive Instructions */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm mb-2">
            Drag the slider to reveal the transformation
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
              Before
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
              After
            </div>
          </div>
        </div>
        
        {/* Stats below the slider */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 bg-[#1c1c1c] rounded-xl border border-gray-800">
            <div className="text-3xl font-bold text-blue-400 mb-2">10x</div>
            <div className="text-gray-300 text-sm">Faster than traditional photoshoots</div>
          </div>
          <div className="text-center p-6 bg-[#1c1c1c] rounded-xl border border-gray-800">
            <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
            <div className="text-gray-300 text-sm">Cost reduction vs. professional shoots</div>
          </div>
          <div className="text-center p-6 bg-[#1c1c1c] rounded-xl border border-gray-800">
            <div className="text-3xl font-bold text-blue-400 mb-2">∞</div>
            <div className="text-gray-300 text-sm">Unlimited variations & styles</div>
          </div>
        </div>
      </div>
    </section>
  )
}
