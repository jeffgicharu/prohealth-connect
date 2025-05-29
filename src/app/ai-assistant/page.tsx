"use client"

import { useState } from "react"
import { useInView } from "react-intersection-observer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, AlertTriangle, Sparkles, Info } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { LoadingButton } from "@/components/ui/loading-button"
import toast from 'react-hot-toast'

export default function AIAssistantPage() {
  const [symptoms, setSymptoms] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [insight, setInsight] = useState("")

  // Intersection Observer hooks for scroll reveal
  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { ref: disclaimerRef, inView: disclaimerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 100,
  })

  const { ref: inputCardRef, inView: inputCardInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 200,
  })

  const { ref: resultsCardRef, inView: resultsCardInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 300,
  })

  const { ref: additionalFeaturesTitleRef, inView: additionalFeaturesTitleInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 400,
  })

  const { ref: feature1Ref, inView: feature1InView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 500,
  })

  const { ref: feature2Ref, inView: feature2InView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 600,
  })

  const { ref: feature3Ref, inView: feature3InView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: 700,
  })

  const handleGetInsights = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setInsight("")

    try {
      const response = await fetch('/api/ai/get-symptom-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = "Failed to get insights. Please try again."; // Default message
        
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          errorMessage = data.details.join("\n"); // If Zod fieldErrors.symptoms is an array
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        toast.error(errorMessage);
        setInsight(""); // Clear any previous insight
        return; // Stop further processing
      }

      setInsight(data.insight)
      toast.success('AI insights generated successfully!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setInsight("");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-white py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ease-out ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
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

        {/* Primary Disclaimer Alert */}
        <Alert 
          ref={disclaimerRef}
          className={`mb-8 border-yellow-200 bg-yellow-50 transition-all duration-700 ease-out ${
            disclaimerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
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
          <Card 
            ref={inputCardRef}
            className={`shadow-md hover:shadow-lg focus-within:shadow-lg hover:scale-105 hover:-translate-y-1 focus-within:scale-105 focus-within:-translate-y-1 transition-all duration-300 ease-in-out border border-brand-light-gray/20 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 transition-all duration-700 ease-out ${
              inputCardInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-primary" />
                Symptom Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="mb-4 text-sm text-brand-light-gray space-y-1">
                <p>You can ask about general health topics or describe symptoms for informational insights.</p>
                <ul className="list-disc list-inside text-xs">
                  <li>Be descriptive but concise.</li>
                  <li>Avoid asking for specific medical diagnoses or treatments.</li>
                  <li>Example: &quot;What are common causes of persistent fatigue?&quot;</li>
                </ul>
              </div>
              <form onSubmit={handleGetInsights} className="space-y-6">
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
                    disabled={isLoading}
                  />
                </div>
                <LoadingButton
                  type="submit"
                  disabled={!symptoms.trim()}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-white py-3 text-lg font-semibold transition-all duration-200"
                  isLoading={isLoading}
                  loadingText="Getting Insights..."
                >
                  <div className="flex items-center justify-center">
                    <Sparkles size={20} className="mr-2" /> Get Insights
                  </div>
                </LoadingButton>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card 
            ref={resultsCardRef}
            className={`shadow-md hover:shadow-lg focus-within:shadow-lg hover:scale-105 hover:-translate-y-1 focus-within:scale-105 focus-within:-translate-y-1 transition-all duration-300 ease-in-out border border-brand-light-gray/20 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 transition-all duration-700 ease-out ${
              resultsCardInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
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
              ) : insight ? (
                <div className="space-y-4">
                  {/* Secondary Disclaimer */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-5 w-5 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Note:</strong> The information below is for educational purposes only and should not be used as a substitute for professional medical advice.
                    </AlertDescription>
                  </Alert>

                  {/* AI Response */}
                  <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/20">
                    <div className="prose prose-sm max-w-none max-h-[400px] overflow-y-auto">
                      <div className="text-brand-dark leading-relaxed">
                        <ReactMarkdown>
                          {insight}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Final Disclaimer */}
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Important Reminder
                    </h4>
                    <p className="text-yellow-700 leading-relaxed">
                      This AI assistant provides general information only. For any health concerns, persistent symptoms, or before making any health-related decisions, please consult with a qualified healthcare professional. Your health and safety are our top priority.
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Additional AI Features */}
        <div 
          ref={additionalFeaturesTitleRef}
          className={`mt-12 transition-all duration-700 ease-out ${
            additionalFeaturesTitleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <h2 className="text-2xl font-bold text-brand-dark mb-8 text-center">Additional AI Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              ref={feature1Ref}
              className={`text-center hover:shadow-md transition-all duration-200 transition-all duration-700 ease-out ${
                feature1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">Symptom Analysis</h3>
                <p className="text-brand-light-gray">
                  Get detailed analysis of your symptoms and potential causes.
                </p>
              </CardContent>
            </Card>

            <Card 
              ref={feature2Ref}
              className={`text-center hover:shadow-md transition-all duration-200 transition-all duration-700 ease-out ${
                feature2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">Health Education</h3>
                <p className="text-brand-light-gray">
                  Learn about various health conditions and preventive measures.
                </p>
              </CardContent>
            </Card>

            <Card 
              ref={feature3Ref}
              className={`text-center hover:shadow-md transition-all duration-200 transition-all duration-700 ease-out ${
                feature3InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">Smart Suggestions</h3>
                <p className="text-brand-light-gray">
                  Receive personalized recommendations for your health concerns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}