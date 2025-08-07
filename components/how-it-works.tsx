import { UploadCloud, Scan, Sparkles } from "lucide-react"

const steps = [
  {
    icon: <UploadCloud className="h-12 w-12 text-blue-500" />,
    title: "Upload Your Garment",
    description: "Upload your clothing item on a plain background.",
  },
  {
    icon: <Scan className="h-12 w-12 text-blue-500" />,
    title: "Add Model & Style Reference",
    description: "Add your model photo and style inspiration for the look you want.",
  },
  {
    icon: <Sparkles className="h-12 w-12 text-blue-500" />,
    title: "Generate & Customize",
    description: "Get hyper-realistic AI fashion images and customize as needed.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 md:py-16" itemScope itemType="https://schema.org/HowTo">
      <meta itemProp="name" content="How to Use AI Fashion Photography" />
      <meta itemProp="description" content="Learn how to create professional fashion photography using AI in three simple steps" />
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">How It Works</h2>
        <p className="text-gray-400 text-sm md:text-base">3 Simple Steps</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="text-center p-8 md:p-10 bg-gray-800/30 rounded-xl border border-gray-700/50 min-h-[280px] md:min-h-[320px] flex flex-col justify-center"
            itemScope
            itemProp="step"
            itemType="https://schema.org/HowToStep"
          >
            <meta itemProp="position" content={String(index + 1)} />
            <div className="flex justify-center mb-6">{step.icon}</div>
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-3" itemProp="name">{step.title}</h3>
            <p className="text-base md:text-lg text-gray-400" itemProp="text">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
