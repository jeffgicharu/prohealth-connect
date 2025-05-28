import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | ProHealth Connect",
  description: "Terms of Service for ProHealth Connect - Your trusted healthcare platform",
}

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg">
        <p className="mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing and using ProHealth Connect, you agree to be bound by these Terms of Service 
            and all applicable laws and regulations. If you do not agree with any of these terms, 
            you are prohibited from using or accessing this platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily use ProHealth Connect for personal, non-commercial 
            transitory viewing only. This is the grant of a license, not a transfer of title, and 
            under this license you may not:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on ProHealth Connect</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Medical Disclaimer</h2>
          <p>
            The information provided on ProHealth Connect is for general informational purposes only 
            and is not intended to be a substitute for professional medical advice, diagnosis, or 
            treatment. Always seek the advice of your physician or other qualified health provider 
            with any questions you may have regarding a medical condition.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
          <p>As a user of ProHealth Connect, you agree to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
            <li>Use the platform in compliance with all applicable laws</li>
            <li>Not engage in any activity that disrupts or interferes with the platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
          <p>
            In no event shall ProHealth Connect be liable for any damages arising out of the use 
            or inability to use the materials on our platform, even if we have been notified 
            of the possibility of such damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
            <br />
            Email: legal@prohealthconnect.com
          </p>
        </section>
      </div>
    </div>
  )
} 