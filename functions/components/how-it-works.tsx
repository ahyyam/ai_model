import { UploadCloud, Scan, Sparkles } from "lucide-react"

const steps = [
  {
    icon: <UploadCloud className="h-10 w-10 text-blue-500" />,
    title: "1. Upload Photo",
    description: "Start with a simple photo of your clothing item on a plain background.",
  },
  {
    icon: <Scan className="h-10 w-10 text-blue-500" />,
    title: "2. Describe Style",
    description: "Tell our AI what you want. 'On a model in Paris' or 'flat lay on a marble surface'.",
  },
  {
    icon: <Sparkles className="h-10 w-10 text-blue-500" />,
    title: "3. Generate Visuals",
    description: "Receive a variety of high-resolution, ready-to-use images in seconds.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">It's As Easy As 1, 2, 3</h2>
        <p className="text-gray-400 text-lg mb-12">Create stunning product visuals in three simple steps.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        {steps.map((step, index) => (
          <div
            key={index}
            className="text-center p-8 bg-[#1c1c1c] rounded-xl border border-gray-800 transform hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="flex justify-center mb-6">{step.icon}</div>
            <h3 className="font-sora text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
