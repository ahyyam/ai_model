"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden mb-3">
              <img 
                src="/logo/logo.png" 
                alt="Zarta Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="font-sora text-2xl md:text-3xl font-bold mb-2">
              Terms of Service
            </h1>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm leading-relaxed">
                By accessing and using Zarta's AI-powered fashion photography services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
              <p className="text-sm leading-relaxed">
                Zarta provides AI-powered fashion photography services that transform plain clothing product photos into styled, high-quality visuals. Our service includes image generation, editing tools, and related features designed for e-commerce and fashion brands.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
              <p className="text-sm leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. You must be at least 18 years old to use this service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
              <p className="text-sm leading-relaxed">
                You agree not to use the service to:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1">
                <li>Generate content that is illegal, harmful, threatening, abusive, or defamatory</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Upload content that contains viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
              <p className="text-sm leading-relaxed">
                You retain ownership of the content you upload. However, by using our service, you grant Zarta a license to process and generate images based on your content. Generated images are subject to our usage rights as outlined in our service agreement.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">6. Payment and Billing</h2>
              <p className="text-sm leading-relaxed">
                Our services are offered on a subscription basis. Payments are processed through Stripe and are non-refundable except as required by law. We reserve the right to change our pricing with 30 days notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">7. Privacy and Data</h2>
              <p className="text-sm leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">8. Service Availability</h2>
              <p className="text-sm leading-relaxed">
                We strive to maintain high service availability but do not guarantee uninterrupted access. We may temporarily suspend the service for maintenance or updates with reasonable notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
              <p className="text-sm leading-relaxed">
                Zarta shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
              <p className="text-sm leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by email or through our website. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">11. Contact Information</h2>
              <p className="text-sm leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at support@zarta.com.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <p className="text-xs text-gray-400">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
