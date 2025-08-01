import Image from "next/image"
import { CheckCircle2, XCircle } from "lucide-react"

interface VisualGuideProps {
  goodExamples: string[]
  badExamples: string[]
}

export default function VisualGuide({ goodExamples, badExamples }: VisualGuideProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Good Examples
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {goodExamples.map((src, i) => (
            <Image
              key={i}
              src={src || "/placeholder.svg"}
              alt="Good example"
              width={200}
              height={200}
              className="rounded-md object-cover aspect-square"
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Bad Examples
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {badExamples.map((src, i) => (
            <Image
              key={i}
              src={src || "/placeholder.svg"}
              alt="Bad example"
              width={200}
              height={200}
              className="rounded-md object-cover aspect-square"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
