import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="py-24 md:py-40 text-center">
      <h1 className="font-sora text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
        Transform Product Photos into
        <br />
        <span className="text-blue-500">Scroll-Stopping Visuals</span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10">
        Modelix.ai uses AI to instantly style your plain clothing images, creating high-converting visuals for your
        brand. No studio required.
      </p>
      <div className="flex justify-center items-center gap-4">
        <Button
          asChild
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-6 rounded-full"
        >
          <Link href="/generate">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
