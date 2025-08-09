"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              How we collect, use, and protect your information.
            </p>
          </div>
        </div>

        {/* Privacy Content */}
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p className="text-sm leading-relaxed mb-3">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
                <li><strong>Account Information:</strong> Name, email address, password, and profile information</li>
                <li><strong>Usage Data:</strong> Images you upload, generated content, and service usage patterns</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through Stripe</li>
                <li><strong>Communication:</strong> Messages, feedback, and support requests</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
                <li>Provide, maintain, and improve our AI-powered fashion photography services</li>
                <li>Process payments and manage your subscription</li>
                <li>Send you important updates about our services</li>
                <li>Respond to your questions and provide customer support</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Ensure compliance with our terms and applicable laws</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
              <p className="text-sm leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user information may be transferred</li>
                <li><strong>Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
              <p className="text-sm leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
              <p className="text-sm leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
              <p className="text-sm leading-relaxed mb-3">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">7. Cookies and Tracking</h2>
              <p className="text-sm leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us remember your preferences, analyze usage patterns, and provide personalized content.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">8. Third-Party Services</h2>
              <p className="text-sm leading-relaxed">
                Our platform may integrate with third-party services such as payment processors, analytics tools, and social media platforms. These services have their own privacy policies, and we encourage you to review them.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">9. Children's Privacy</h2>
              <p className="text-sm leading-relaxed">
                Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">10. International Data Transfers</h2>
              <p className="text-sm leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last Updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
              <p className="text-sm leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-2 text-sm">
                <p>Email: privacy@zarta.com</p>
                <p>Address: [Your Business Address]</p>
              </div>
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
