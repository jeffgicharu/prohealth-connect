"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Target, Users, Shield, Award, Globe } from "lucide-react"

export default function AboutPage() {
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

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description:
        "We prioritize empathy and understanding in every interaction, ensuring our users feel heard and supported throughout their wellness journey.",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "Your health data and privacy are paramount. We maintain the highest standards of security and confidentiality in all our services.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We strive for excellence in everything we do, from our AI technology to our healthcare partnerships and user experience.",
    },
    {
      icon: Users,
      title: "Accessibility",
      description:
        "Healthcare should be accessible to everyone. We work to break down barriers and make wellness services available to all.",
    },
    {
      icon: Globe,
      title: "Innovation",
      description:
        "We embrace cutting-edge technology and innovative approaches to transform how people access and manage their health.",
    },
    {
      icon: Target,
      title: "Results-Focused",
      description:
        "We measure our success by the positive impact we have on our users' health outcomes and overall well-being.",
    },
  ]

  return (
    <div className="min-h-screen bg-brand-white py-12 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16 scroll-reveal">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            About <span className="text-brand-primary">ProHealth Connect</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-light-gray max-w-3xl mx-auto leading-relaxed">
            Transforming healthcare through technology, compassion, and innovation. We're building the future of
            accessible, personalized wellness services.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16 scroll-reveal">
          <Card className="border-brand-light-gray/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-brand-primary" />
                </div>
                <h2 className="text-3xl font-bold text-brand-dark mb-4">Our Mission</h2>
              </div>
              <p className="text-lg text-brand-dark leading-relaxed text-center max-w-4xl mx-auto">
                To democratize access to quality healthcare by leveraging artificial intelligence and modern technology.
                We believe that everyone deserves personalized, accessible, and affordable wellness services that
                empower them to take control of their health journey. Through our platform, we connect users with
                trusted healthcare professionals while providing AI-powered insights that enhance understanding and
                promote proactive health management.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Vision Section */}
        <section className="mb-16 scroll-reveal">
          <Card className="border-brand-light-gray/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-brand-primary" />
                </div>
                <h2 className="text-3xl font-bold text-brand-dark mb-4">Our Vision</h2>
              </div>
              <p className="text-lg text-brand-dark leading-relaxed text-center max-w-4xl mx-auto">
                To create a world where healthcare is predictive, preventive, personalized, and participatory. We
                envision a future where technology seamlessly integrates with human care to provide comprehensive
                wellness solutions that adapt to individual needs. Our goal is to become the leading platform that
                bridges the gap between traditional healthcare and modern digital innovation, making quality health
                services accessible to communities worldwide.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-16 scroll-reveal">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">Our Core Values</h2>
            <p className="text-lg text-brand-light-gray max-w-3xl mx-auto">
              These principles guide everything we do and shape how we serve our community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border-brand-light-gray/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-3">{value.title}</h3>
                  <p className="text-brand-light-gray leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="scroll-reveal">
          <Card className="border-brand-light-gray/20 bg-gradient-to-r from-brand-primary/5 to-brand-primary/10">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold text-brand-dark mb-6">Built with Purpose</h2>
              <p className="text-lg text-brand-dark leading-relaxed max-w-4xl mx-auto mb-8">
                ProHealth Connect was created by a passionate team of healthcare professionals, technology experts, and
                user experience designers who share a common vision: making healthcare more accessible, understandable,
                and effective for everyone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-primary mb-2">10+</div>
                  <p className="text-brand-dark font-medium">Healthcare Partners</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-primary mb-2">1000+</div>
                  <p className="text-brand-dark font-medium">Users Served</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-primary mb-2">24/7</div>
                  <p className="text-brand-dark font-medium">AI Assistant Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
