import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import StructuredData, { FAQData } from "@/components/seo/structured-data"

const faqs = [
  {
    question: "What kind of product photos work best with Zarta AI?",
    answer:
      "For optimal results, use clear, well-lit photos of your product on a neutral, uncluttered background. PNGs with transparent backgrounds work excellently. Avoid busy backgrounds, shadows, or poor lighting as these can affect AI generation quality.",
  },
  {
    question: "Do I own the rights to the AI-generated images?",
    answer:
      "Yes, on all paid plans, you have full commercial rights to use the images you generate for any purpose, including marketing, social media, e-commerce stores, and print materials. The images are yours to use without any additional licensing fees.",
  },
  {
    question: "Can Zarta AI match my specific brand aesthetic and style?",
    answer:
      "Absolutely! You can guide the AI with detailed text prompts, reference images, and color palettes to ensure the generated visuals align perfectly with your brand identity. Our Pro and Elite plans offer advanced customization options, and the Enterprise plan includes custom model training for even greater consistency.",
  },
  {
    question: "What file formats and resolutions can I download?",
    answer:
      "You can download your generated images in high-resolution JPEG or PNG formats. Basic plans include HD downloads, Pro plans include 4K resolution, and Elite plans offer maximum quality options. All images are ready for web and print use.",
  },
  {
    question: "What if I'm not satisfied with the AI-generated results?",
    answer:
      "Our AI allows for multiple iterations and refinements. You can adjust your prompts, try different styles, and generate new options until you're completely satisfied. Each generation provides unique variations, and our support team is here to help optimize your results.",
  },
  {
    question: "How does Zarta AI compare to traditional fashion photography?",
    answer:
      "Zarta AI delivers professional-quality results in seconds instead of weeks, at 95% less cost than traditional photoshoots. While traditional photography offers unique artistic value, our AI provides consistent, scalable, and cost-effective solutions perfect for e-commerce and marketing needs.",
  },
]

export default function FaqSection() {
  return (
    <section id="faq" className="section-zarta-lg" itemScope itemType="https://schema.org/FAQPage">
      <StructuredData type="faq" data={FAQData} />
      <div className="text-center max-w-4xl mx-auto mb-16 space-md">
        <h2 className="heading-2 text-white">Frequently Asked Questions</h2>
      </div>
      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="w-full space-md">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="border-gray-800"
              itemScope 
              itemProp="mainEntity" 
              itemType="https://schema.org/Question"
            >
              <AccordionTrigger 
                className="text-left text-lg hover:no-underline text-white font-semibold"
                itemProp="name"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent 
                className="text-body text-gray-400"
                itemScope 
                itemProp="acceptedAnswer" 
                itemType="https://schema.org/Answer"
              >
                <div itemProp="text">{faq.answer}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
