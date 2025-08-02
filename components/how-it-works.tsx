import { UploadCloud, Scan, Sparkles } from "lucide-react"

const steps = [
  {
    icon: <UploadCloud className="h-10 w-10 text-blue-500" />,
    title: "1. Upload Product Photo",
    description: "Start with a simple photo of your clothing item on a plain background. Our AI fashion photography platform works with any product photography style.",
  },
  {
    icon: <Scan className="h-10 w-10 text-blue-500" />,
    title: "2. Describe Your Style",
    description: "Tell our AI what you want. 'On a model in Paris' or 'flat lay on a marble surface'. Professional e-commerce photography made simple.",
  },
  {
    icon: <Sparkles className="h-10 w-10 text-blue-500" />,
    title: "3. Generate Professional Visuals",
    description: "Receive a variety of high-resolution, ready-to-use images in seconds. AI-powered fashion photography that transforms your product photos.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32" itemScope itemType="https://schema.org/HowTo">
      <meta itemProp="name" content="How to Use AI Fashion Photography" />
      <meta itemProp="description" content="Learn how to create professional fashion photography using AI in three simple steps" />
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="heading-2 mb-4" itemProp="name">How AI Fashion Photography Works</h2>
        <p className="body-medium mb-12" itemProp="description">Create stunning product visuals and professional e-commerce photography in three simple steps with our AI fashion photography platform.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        {steps.map((step, index) => (
          <div
            key={index}
            className="card-zarta text-center p-8 transform hover:-translate-y-2 transition-transform duration-300"
            itemScope
            itemProp="step"
            itemType="https://schema.org/HowToStep"
          >
            <meta itemProp="position" content={String(index + 1)} />
            <div className="flex justify-center mb-6">{step.icon}</div>
            <h3 className="heading-3 mb-2" itemProp="name">{step.title}</h3>
            <p className="body-medium" itemProp="text">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
