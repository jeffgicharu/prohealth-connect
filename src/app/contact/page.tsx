"use client"

import type React from "react"
import { useInView } from "react-intersection-observer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import toast from 'react-hot-toast'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Define the contact form schema
const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  subject: z.string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  // Intersection Observer hooks for scroll reveal
  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { ref: contactInfoRef, inView: contactInfoInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 100,
  })

  const { ref: contactFormRef, inView: contactFormInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 200,
  })

  const { ref: faqRef, inView: faqInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 300,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: "onTouched"
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.details?.fieldErrors) {
          // Handle field-specific errors
          Object.entries(responseData.details.fieldErrors).forEach(([field, errors]) => {
            if (Array.isArray(errors) && errors.length > 0) {
              setError(field as keyof ContactFormData, {
                type: 'server',
                message: errors[0]
              });
            }
          });
        } else {
          // Use server-provided error message or fallback
          throw new Error(responseData.error || responseData.message || 'Unable to send your message. Please check your input and try again.');
        }
        return;
      }

      toast.success('Message sent successfully! We will get back to you soon.')
      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again or contact us directly via phone or email.';
      console.error('Contact form error:', error);
      toast.error(errorMessage);
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
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ease-out ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            Contact <span className="text-brand-primary">Us</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-light-gray max-w-3xl mx-auto">
            We&apos;re here to help! Reach out to us with any questions, concerns, or feedback about our services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div 
            ref={contactInfoRef}
            className={`transition-all duration-700 ease-out ${
              contactInfoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <h2 className="text-2xl font-bold text-brand-dark mb-8">Get in Touch</h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-brand-light-gray/20 shadow-sm hover:shadow-lg hover:scale-102 hover:-translate-y-0.5 transition-all duration-300 ease-in-out rounded-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-brand-dark mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-brand-light-gray break-words">
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
          <div 
            ref={contactFormRef}
            className={`transition-all duration-700 ease-out ${
              contactFormInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <Card className="shadow-md hover:shadow-lg focus-within:shadow-lg hover:scale-105 hover:-translate-y-1 focus-within:scale-105 focus-within:-translate-y-1 transition-all duration-300 ease-in-out border-brand-light-gray/20 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-brand-dark">Send us a Message</CardTitle>
                <p className="text-brand-light-gray">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-brand-dark font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        {...register("name")}
                        className="border-brand-light-gray/30 focus:border-brand-primary"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-brand-dark font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...register("email")}
                        className="border-brand-light-gray/30 focus:border-brand-primary"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                      )}
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
                      {...register("subject")}
                      className="border-brand-light-gray/30 focus:border-brand-primary"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-sm">{errors.subject.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-brand-dark font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Your message here..."
                      {...register("message")}
                      className="min-h-[150px] border-brand-light-gray/30 focus:border-brand-primary"
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm">{errors.message.message}</p>
                    )}
                  </div>
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </LoadingButton>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div 
          ref={faqRef}
          className={`mt-16 transition-all duration-700 ease-out ${
            faqInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <Card className="border-brand-light-gray/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">How quickly can I expect a response?</h3>
                  <p className="text-brand-light-gray">
                    We typically respond to all inquiries within 24-48 business hours. For urgent matters, please call us directly.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">Do you offer emergency services?</h3>
                  <p className="text-brand-light-gray">
                    No, we do not provide emergency medical services. In case of a medical emergency, please call emergency services or visit your nearest hospital.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-2">Can I schedule an appointment through this form?</h3>
                  <p className="text-brand-light-gray">
                    While you can request an appointment through this form, we recommend using our online booking system for immediate scheduling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
