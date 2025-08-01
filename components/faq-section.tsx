import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What kind of product photos work best?",
    answer:
      "For optimal results, use clear, well-lit photos of your product on a neutral, uncluttered background. PNGs with transparent backgrounds also work great.",
  },
  {
    question: "Do I own the rights to the generated images?",
    answer:
      "Yes, on all paid plans, you have full commercial rights to use the images you generate for any purpose, including marketing, social media, and on your e-commerce store.",
  },
  {
    question: "Can the AI match my specific brand aesthetic?",
    answer:
      "Absolutely. You can guide the AI with detailed text prompts, reference images, and color palettes to ensure the generated visuals align perfectly with your brand identity. Our Enterprise plan offers custom model training for even greater consistency.",
  },
  {
    question: "What file formats can I download?",
    answer:
      "You can download your generated images in high-resolution JPEG or PNG formats, ready for web and print use.",
  },
  {
    question: "What if I'm not happy with the results?",
    answer:
      "Our AI allows for multiple iterations. You can refine your prompts, try different styles, and generate new options until you're satisfied. Each generation provides a new set of unique images.",
  },
]

export default function FaqSection() {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-400 text-lg mb-12">Have questions? We've got answers.</p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-gray-800">
              <AccordionTrigger className="text-left text-lg hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-400 text-base">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
