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
    <div className={cn("grid md:grid-cols-2 gap-12 md:gap-20 items-center", reverse && "md:grid-flow-col-dense")} itemScope itemType="https://schema.org/Feature">
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <div className={cn("md:order-1", reverse && "md:order-2")}>
        <div className="badge-primary mb-4">
          <Icon className="icon-base" />
          {benefit}
        </div>
        <h3 className="heading-3 mb-4" itemProp="name">{title}</h3>
        <p className="body-medium" itemProp="description">{description}</p>
      </div>
      <div className={cn("md:order-2", reverse && "md:order-1")}>
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={`${title} - ${description}`}
          width={500}
          height={500}
          className="rounded-xl object-cover w-full h-full"
          itemProp="image"
        />
      </div>
    </div>
  )
}
