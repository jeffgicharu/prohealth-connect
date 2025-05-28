"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Base navigation links
  const baseNavLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/ai-assistant", label: "AI Assistant" },
  ]

  // Create navigation links based on auth status
  const navLinks = [...baseNavLinks]
  if (status === "authenticated") {
    navLinks.push({ href: "/dashboard/bookings", label: "My Bookings" })
  }

  const handleLogin = () => {
    router.push("/login")
  }

  const handleSignUp = () => {
    router.push("/signup")
  }

  // Debug session status
  useEffect(() => {
    console.log("Session status:", status)
    console.log("Session data:", session)
  }, [status, session])

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-white border-b border-brand-light-gray/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-brand-primary hover:text-brand-primary-hover transition-colors duration-200"
          >
            ProHealth Connect
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-dark hover:text-brand-primary font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {status === "loading" && (
              <p className="text-brand-dark">Loading...</p>
            )}
            
            {status === "unauthenticated" && (
              <>
                <Button
                  variant="outline"
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary-hover transition-all duration-200"
                  onClick={handleLogin}
                >
                  Login
                </Button>
                <Button 
                  className="bg-brand-primary hover:bg-brand-primary-hover text-brand-white transition-all duration-200"
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>
              </>
            )}

            {status === "authenticated" && session?.user && (
              <>
                <span className="text-sm text-brand-dark">Hi, {session.user.name || session.user.email}</span>
                <Button 
                  variant="ghost" 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-brand-dark hover:text-brand-primary"
                >
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-brand-dark hover:text-brand-primary transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-brand-light-gray/30">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-brand-dark hover:text-brand-primary font-medium transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-brand-light-gray/30">
                {status === "loading" && (
                  <p className="text-brand-dark">Loading...</p>
                )}
                
                {status === "unauthenticated" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-brand-primary text-brand-primary hover:bg-brand-primary/10"
                      onClick={handleLogin}
                    >
                      Login
                    </Button>
                    <Button 
                      className="bg-brand-primary hover:bg-brand-primary-hover text-brand-white"
                      onClick={handleSignUp}
                    >
                      Sign Up
                    </Button>
                  </>
                )}

                {status === "authenticated" && session?.user && (
                  <>
                    <span className="text-sm text-brand-dark">Hi, {session.user.name || session.user.email}</span>
                    <Button 
                      variant="ghost" 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-brand-dark hover:text-brand-primary"
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 