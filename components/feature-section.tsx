import Image from "next/image"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FeatureSectionProps {
  title: string
  description: string
  imageUrl: string
  Icon: LucideIcon
  benefit: string
  reverse?: boolean
}

export default function FeatureSection({
  title,
  description,
  imageUrl,
  Icon,
  benefit,
  reverse = false,
}: FeatureSectionProps) {
  return (
    <div className={cn("grid md:grid-cols-2 gap-12 md:gap-20 items-center", reverse && "md:grid-flow-col-dense")}>
      <div className={cn("md:order-1", reverse && "md:order-2")}>
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <Icon className="h-4 w-4" />
          {benefit}
        </div>
        <h3 className="font-sora text-3xl md:text-4xl font-bold mb-4">{title}</h3>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>
      <div className={cn("md:order-2", reverse && "md:order-1")}>
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          width={500}
          height={500}
          className="rounded-xl object-cover w-full h-full shadow-2xl shadow-blue-500/10"
        />
      </div>
    </div>
  )
}
