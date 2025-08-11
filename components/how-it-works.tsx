import { UploadCloud, Scan, Sparkles } from "lucide-react"

const steps = [
  {
    icon: <UploadCloud className="h-12 w-12 text-blue-500" />,
    title: "Upload Your Garment",
  },
  {
    icon: <Scan className="h-12 w-12 text-blue-500" />,
    title: "Add Style & Model Reference",
  },
  {
    icon: <Sparkles className="h-12 w-12 text-blue-500" />,
    title: "Generate & Download",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-zarta-sm" itemScope itemType="https://schema.org/HowTo">
      <meta itemProp="name" content="How to Use AI Fashion Photography" />
      <meta itemProp="description" content="Learn how to create professional fashion photography using AI in three simple steps" />
      <div className="text-center max-w-3xl mx-auto mb-12 space-md">
        <h2 className="heading-2 text-white">How It Works</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="text-center p-6 md:p-8 bg-gray-800/30 rounded-xl border border-gray-700/50 flex flex-col justify-center hover:border-gray-600/50 transition-all duration-300"
            itemScope
            itemProp="step"
            itemType="https://schema.org/HowToStep"
          >
            <meta itemProp="position" content={String(index + 1)} />
            <div className="flex justify-center mb-6">{step.icon}</div>
            <h3 className="heading-4 text-white mb-4" itemProp="name">{step.title}</h3>
          </div>
        ))}
      </div>
    </section>
  )
}
