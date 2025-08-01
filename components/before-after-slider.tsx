"use client"

import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider"

export default function BeforeAfterSlider() {
  return (
    <section id="before-after" className="py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">From Plain to Premium</h2>
        <p className="text-gray-400 text-lg mb-12">
          See the dramatic transformation Modelix.ai brings to your product photos.
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <ReactCompareSlider
          className="rounded-xl overflow-hidden border-4 border-gray-800"
          itemOne={<ReactCompareSliderImage src="/placeholder.svg?height=720&width=1280" alt="Before" />}
          itemTwo={<ReactCompareSliderImage src="/placeholder.svg?height=720&width=1280" alt="After" />}
        />
      </div>
    </section>
  )
}
