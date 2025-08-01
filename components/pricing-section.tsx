import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const plans = [
  {
    name: "Basic",
    price: "$30",
    period: "",
    description: "Perfect for getting started with image generation.",
    features: ["10 image generations", "Basic styling options", "Email support", "$3.00 per image"],
    isPopular: false,
    color: "border-blue-500",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    badge: "Starter"
  },
  {
    name: "Pro",
    price: "$40",
    period: "",
    description: "Great value for growing businesses and creators.",
    features: ["20 image generations", "Advanced styling options", "Priority processing", "Priority support", "$2.00 per image"],
    isPopular: true,
    color: "border-purple-500",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    badge: "Better Value"
  },
  {
    name: "Elite",
    price: "$75",
    period: "",
    description: "Best value for high-volume image generation needs.",
    features: ["50 image generations", "All Pro features", "Custom integrations", "Dedicated support", "$1.50 per image"],
    isPopular: false,
    color: "border-pink-500",
    buttonColor: "bg-pink-600 hover:bg-pink-700",
    badge: "Best Value ⭐"
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-400 text-lg mb-12">Simple, transparent pricing that scales with your needs.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "bg-[#1c1c1c] border-gray-800 text-white flex flex-col",
              plan.isPopular && `${plan.color} border-2 relative`,
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-sora text-2xl flex items-center gap-2">
                {plan.name}
                {plan.name === "Elite" && <Star className="h-5 w-5 text-yellow-400" />}
              </CardTitle>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <CardDescription className="pt-2 !text-gray-400">{plan.description}</CardDescription>
              <div className="flex items-center gap-1 pt-1">
                <span className="text-sm text-gray-300">{plan.badge}</span>
                {plan.name === "Elite" && <Star className="h-3 w-3 text-yellow-400" />}
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-blue-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={cn(
                  "w-full mt-auto text-white",
                  plan.buttonColor
                )}
              >
                <Link href="/billing">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
