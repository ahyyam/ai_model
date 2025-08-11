import { UploadCloud, Scan, Sparkles } from "lucide-react"

const steps = [
  {
    icon: <UploadCloud className="h-12 w-12 text-blue-500" />,
    title: "Upload Your Garment",
    description: "Simply upload a clear photo of your clothing item on a plain background. Our AI works best with well-lit, uncluttered product images.",
  },
  {
    icon: <Scan className="h-12 w-12 text-blue-500" />,
    title: "Add Style & Model Reference",
    description: "Choose your preferred model type and upload style inspiration images. Customize the look, pose, and aesthetic to match your brand vision.",
  },
  {
    icon: <Sparkles className="h-12 w-12 text-blue-500" />,
    title: "Generate & Download",
    description: "Get multiple hyper-realistic AI fashion images in seconds. Download high-resolution files ready for your e-commerce store, social media, and marketing campaigns.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-zarta-sm" itemScope itemType="https://schema.org/HowTo">
      <meta itemProp="name" content="How to Use AI Fashion Photography" />
      <meta itemProp="description" content="Learn how to create professional fashion photography using AI in three simple steps" />
      <div className="text-center max-w-3xl mx-auto mb-12 space-md">
        <h2 className="heading-2 text-white">How It Works</h2>
        <p className="text-lead text-gray-400">3 Simple Steps</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="text-center p-8 md:p-10 bg-gray-800/30 rounded-xl border border-gray-700/50 min-h-[300px] md:min-h-[340px] flex flex-col justify-center hover:border-gray-600/50 transition-all duration-300"
            itemScope
            itemProp="step"
            itemType="https://schema.org/HowToStep"
          >
            <meta itemProp="position" content={String(index + 1)} />
            <div className="flex justify-center mb-8">{step.icon}</div>
            <h3 className="heading-4 text-white mb-4" itemProp="name">{step.title}</h3>
            <p className="text-body text-gray-400" itemProp="text">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
