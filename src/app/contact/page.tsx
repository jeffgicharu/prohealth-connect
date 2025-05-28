"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import toast from 'react-hot-toast'
import { handleApiError } from '@/lib/utils/errorHandling'
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".scroll-reveal")
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Location",
      details: ["123 Health Street", "Nairobi, Kenya", "00100"],
    },
    {
      icon: Phone,
      title: "Phone Number",
      details: ["+254 700 123 456", "+254 20 123 4567"],
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["support@prohealthconnect.com", "info@prohealthconnect.com"],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 8:00 AM - 6:00 PM", "Saturday: 9:00 AM - 4:00 PM", "Sunday: Closed"],
    },
  ]

  return (
    <div className="min-h-screen bg-brand-white py-12 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16 scroll-reveal">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            Contact <span className="text-brand-primary">Us</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-light-gray max-w-3xl mx-auto">
            We&apos;re here to help! Reach out to us with any questions, concerns, or feedback about our services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="scroll-reveal">
            <h2 className="text-2xl font-bold text-brand-dark mb-8">Get in Touch</h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-brand-light-gray/20 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-brand-dark mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-brand-light-gray">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Notice */}
            <Card className="mt-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-red-800 mb-2">Medical Emergency?</h3>
                <p className="text-red-700 text-sm">
                  If you&apos;re experiencing a medical emergency, please call emergency services immediately at 999 or visit
                  your nearest emergency room. This contact form is not monitored 24/7 and should not be used for urgent
                  medical situations.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="scroll-reveal">
            <Card className="border-brand-light-gray/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-brand-dark">Send us a Message</CardTitle>
                <p className="text-brand-light-gray">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-brand-dark font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="border-brand-light-gray/30 focus:border-brand-primary"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-brand-dark font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="border-brand-light-gray/30 focus:border-brand-primary"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-brand-dark font-medium">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className="border-brand-light-gray/30 focus:border-brand-primary"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-brand-dark font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      className="min-h-32 border-brand-light-gray/30 focus:border-brand-primary resize-none"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <LoadingButton
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-white h-12 text-lg font-semibold transition-all duration-200"
                    isLoading={isLoading}
                    loadingText="Sending..."
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </LoadingButton>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 scroll-reveal">
          <Card className="border-brand-light-gray/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Frequently Asked Questions</h2>
              <p className="text-brand-light-gray mb-6">
                Before reaching out, you might find the answer to your question in our FAQ section.
              </p>
              <Button variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary/10">
                View FAQ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
