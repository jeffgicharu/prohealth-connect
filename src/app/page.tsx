"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Calendar, Shield, Search, CreditCard, Users } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const observerRef = useRef<IntersectionObserver | null>(null)

  const handleExploreServices = () => {
    router.push("/services")
  }

  const handleTryAIAssistant = () => {
    router.push("/ai-assistant")
  }

  const handleGetStarted = () => {
    router.push("/signup")
  }

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

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-brand-white to-gray-50/50 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              Modern Health, <span className="text-brand-primary">Simplified</span> &{" "}
              <span className="text-brand-primary">Accessible</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-brand-light-gray mb-8 max-w-4xl mx-auto leading-relaxed">
              Your trusted partner for AI-powered health insights and seamless wellness service bookings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover text-brand-white px-8 py-4 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
                onClick={handleExploreServices}
              >
                Explore Our Services
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-brand-primary text-brand-primary hover:bg-brand-primary/10 px-8 py-4 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
                onClick={handleTryAIAssistant}
              >
                Try AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Services Overview Section */}
      <section className="py-20 px-6 lg:px-8 bg-brand-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 id="features-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-dark mb-6">
              Discover How ProHealth Connect <span className="text-brand-primary">Empowers You</span>
            </h2>
            <p className="text-lg md:text-xl text-brand-light-gray max-w-3xl mx-auto">
              Experience the future of healthcare with our innovative platform designed for your wellness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="region" aria-label="Key features">
            {/* Card 1: AI-Powered Insights */}
            <Card className="scroll-reveal hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border-brand-light-gray/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                  <Brain className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-4">AI-Powered Insights</h3>
                <p className="text-brand-light-gray leading-relaxed">
                  Access general health information and document summaries through our intelligent assistant. (Always
                  consult a doctor for medical advice)
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Easy Service Booking */}
            <Card className="scroll-reveal hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border-brand-light-gray/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                  <Calendar className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-4">Easy Service Booking</h3>
                <p className="text-brand-light-gray leading-relaxed">
                  Browse and book wellness consultations seamlessly. Choose your preferred service and time with ease.
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Secure & Diverse Payments */}
            <Card className="scroll-reveal hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border-brand-light-gray/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                  <Shield className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-4">Secure & Diverse Payments</h3>
                <p className="text-brand-light-gray leading-relaxed">
                  Pay for your services securely using Stripe for card payments or M-Pesa for local convenience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-dark mb-6">
              How It <span className="text-brand-primary">Works</span>
            </h2>
            <p className="text-lg md:text-xl text-brand-light-gray max-w-3xl mx-auto">
              Get started with ProHealth Connect in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center scroll-reveal">
              <div className="relative">
                <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-brand-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-primary-hover rounded-full flex items-center justify-center text-brand-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-4">Sign Up / Explore</h3>
              <p className="text-brand-light-gray leading-relaxed">
                Create your account or explore our AI tools to get started on your wellness journey.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center scroll-reveal">
              <div className="relative">
                <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-brand-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-primary-hover rounded-full flex items-center justify-center text-brand-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-4">Book & Pay</h3>
              <p className="text-brand-light-gray leading-relaxed">
                Choose a service and pay securely online using your preferred payment method.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center scroll-reveal">
              <div className="relative">
                <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-brand-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-primary-hover rounded-full flex items-center justify-center text-brand-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-4">Connect & Thrive</h3>
              <p className="text-brand-light-gray leading-relaxed">
                Access your services and health insights to maintain and improve your wellness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call-to-Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-primary/5 to-brand-primary/10">
        <div className="max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto text-center scroll-reveal">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-dark mb-6">
            Ready to Take Control of Your <span className="text-brand-primary">Wellness Journey?</span>
          </h2>
          <p className="text-lg md:text-xl text-brand-light-gray mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust ProHealth Connect for their health and wellness needs.
          </p>
          <Button
            size="lg"
            className="w-full max-w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-white px-4 py-6 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-normal text-base sm:text-lg md:text-xl"
            onClick={handleGetStarted}
          >
            Get Started with ProHealth Connect
          </Button>
        </div>
      </section>
    </div>
  )
}
