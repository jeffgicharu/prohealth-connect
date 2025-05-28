import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Toaster } from 'react-hot-toast'
import "./globals.css"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "ProHealth Connect - Modern Health, Simplified & Accessible",
  description: "Your trusted partner for AI-powered health insights and seamless wellness service bookings.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <div className="min-h-screen flex flex-col">
          <SessionProviderWrapper>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#22c55e',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </SessionProviderWrapper>
        </div>
      </body>
    </html>
  )
}
