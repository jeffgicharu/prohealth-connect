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
  title: 'ProHealth Connect',
  description: 'Your trusted platform for wellness services and health insights',
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
    apple: '/favicon-48.png',
  },
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
