"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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
              <Loader2 className="h-5 w-5 text-brand-primary animate-spin" />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                    <AvatarFallback>{
                      session.user.name
                        ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
                        : session.user.email
                          ? session.user.email.slice(0,2).toUpperCase()
                          : 'U'
                    }</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {session.user.name || session.user.email || 'My Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/bookings" className="flex items-center gap-2">
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="w-4 h-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-brand-dark hover:text-brand-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
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
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-5 w-5 text-brand-primary animate-spin" />
                  </div>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Avatar className="cursor-pointer">
                          <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                          <AvatarFallback>{
                            session.user.name
                              ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
                              : session.user.email
                                ? session.user.email.slice(0,2).toUpperCase()
                                : 'U'
                          }</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {session.user.name || session.user.email || 'My Account'}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile" className="flex items-center gap-2">
                            <User className="w-4 h-4" /> Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/bookings" className="flex items-center gap-2">
                            My Bookings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 cursor-pointer">
                          <LogOut className="w-4 h-4" /> Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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