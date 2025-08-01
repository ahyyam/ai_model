import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Modelix.ai transformed our product photography workflow. We went from spending $5K per photoshoot to generating unlimited variations for $49/month. Our conversion rates increased by 35%.",
    author: "Sarah Chen",
    title: "Marketing Director",
    company: "Urban Thread Co.",
    rating: 5,
  },
  {
    quote:
      "The quality is incredible. Our customers can't tell the difference between AI-generated images and traditional photography. It's saved us months of production time.",
    author: "Marcus Rodriguez",
    title: "Founder",
    company: "Streetwear Collective",
    rating: 5,
  },
  {
    quote:
      "As a small brand, we couldn't afford professional photoshoots for every product. Modelix.ai leveled the playing field and made our products look as premium as the big brands.",
    author: "Emma Thompson",
    title: "Creative Director",
    company: "Minimalist Studio",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">Loved by Fashion Brands</h2>
        <p className="text-gray-400 text-lg">See what our customers are saying about their results.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-[#1c1c1c] border-gray-800 text-white h-full">
            <CardContent className="p-8 flex flex-col h-full">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <blockquote className="text-gray-300 mb-6 flex-grow leading-relaxed">"{testimonial.quote}"</blockquote>

              <div className="mt-auto">
                <div className="font-semibold text-white">{testimonial.author}</div>
                <div className="text-sm text-gray-400">
                  {testimonial.title} at {testimonial.company}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
