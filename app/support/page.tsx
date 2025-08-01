import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white font-sora">Contact Support</h1>
        <p className="text-gray-400 mt-1">We're here to help. Fill out the form and we'll get back to you.</p>
      </div>

      <Card className="bg-[#1c1c1c] border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            Get in Touch
          </CardTitle>
          <CardDescription>Tell us how we can help you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your Name" className="bg-gray-800/50 border-gray-700" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Your Email" className="bg-gray-800/50 border-gray-700" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="What's this about?" className="bg-gray-800/50 border-gray-700" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your issue or question in detail..."
              className="bg-gray-800/50 border-gray-700 min-h-[120px]"
            />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
        </CardContent>
      </Card>
    </div>
  )
}
