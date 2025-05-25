import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-brand-white border-t border-brand-light-gray/30 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Primary Copyright Line */}
          <p className="text-brand-dark font-medium">© {currentYear} ProHealth Connect. All rights reserved.</p>

          {/* Secondary Line */}
          <p className="text-brand-light-gray text-sm">Built for portfolio purposes by [Your Name]</p>

          {/* Optional Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/privacy"
              className="text-brand-light-gray hover:text-brand-primary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-brand-light-gray">•</span>
            <Link
              href="/terms"
              className="text-brand-light-gray hover:text-brand-primary transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <span className="text-brand-light-gray">•</span>
            <Link
              href="/contact"
              className="text-brand-light-gray hover:text-brand-primary transition-colors duration-200"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 