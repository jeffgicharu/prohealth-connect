"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, AlertTriangle, Sparkles } from "lucide-react"

export default function AIAssistantPage() {
  const [symptoms, setSymptoms] = useState("")
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

  const handleGetInsights = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-brand-white py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12 scroll-reveal">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-brand-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            Your AI <span className="text-brand-primary">Health Assistant</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-light-gray max-w-3xl mx-auto">
            Get general health information and insights powered by artificial intelligence. Our AI assistant can help
            you understand symptoms and provide educational content.
          </p>
        </div>

        {/* Disclaimer Alert */}
        <Alert className="mb-8 scroll-reveal border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800 font-medium">
            <strong>Important Disclaimer:</strong> This AI Assistant provides general information only and is not a
            substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified
            healthcare provider for any health concerns.
          </AlertDescription>
        </Alert>

        {/* Main Interaction Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="scroll-reveal">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-primary" />
                Symptom Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-brand-dark font-medium">
                  Describe your symptoms or health query:
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="e.g., I've had a persistent cough and mild fever for three days..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-32 border-brand-light-gray/30 focus:border-brand-primary resize-none"
                />
              </div>
              <Button
                onClick={handleGetInsights}
                disabled={!symptoms.trim() || isLoading}
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-white py-3 text-lg font-semibold transition-all duration-200"
              >
                {isLoading ? "Analyzing..." : "Get AI Insights"}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="scroll-reveal">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-dark">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {!symptoms.trim() ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-brand-light-gray/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-brand-light-gray" />
                  </div>
                  <p className="text-brand-light-gray">
                    Enter your symptoms above to receive AI-generated insights and general health information.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Brain className="w-8 h-8 text-brand-primary" />
                  </div>
                  <p className="text-brand-dark font-medium">Analyzing your symptoms...</p>
                  <p className="text-brand-light-gray text-sm mt-2">This may take a few moments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/20">
                    <h4 className="font-semibold text-brand-dark mb-2">General Information:</h4>
                    <p className="text-brand-dark leading-relaxed">
                      Your AI-generated insights will appear here based on the symptoms you've described. The AI will
                      provide general health information and educational content.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Recommendation:</h4>
                    <p className="text-yellow-700 leading-relaxed">
                      For persistent or concerning symptoms, please consult with a healthcare professional for proper
                      evaluation and treatment.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="mt-12 scroll-reveal">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">Additional AI Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">Health Education</h3>
                <p className="text-brand-light-gray text-sm">Learn about various health topics and conditions</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">Wellness Tips</h3>
                <p className="text-brand-light-gray text-sm">Get personalized wellness and lifestyle recommendations</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">Risk Assessment</h3>
                <p className="text-brand-light-gray text-sm">Understand potential health risks and prevention</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
