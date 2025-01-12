import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { useSiteConfig } from '../../hooks/useSiteConfig'

export function Footer() {
  const { 
    siteName, 
    supportPhone, 
    supportEmail, 
    supportLocation 
  } = useSiteConfig();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative border-t border-gray-200 pt-16 pb-10 bg-white"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-50" />
      <div className="relative container mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-[#0095E7]">
              {siteName}
            </Link>
            <p className="text-sm text-gray-600">
              Empowering your financial journey through network marketing excellence.
            </p>
            <div className="flex flex-col space-y-2">
              {supportPhone && (
                <a href={`tel:${supportPhone}`} className="text-sm text-gray-600 hover:text-[#0095E7]">
                  {supportPhone}
                </a>
              )}
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className="text-sm text-gray-600 hover:text-[#0095E7]">
                  {supportEmail}
                </a>
              )}
              {supportLocation && (
                <p className="text-sm text-gray-600">
                  {supportLocation}
                </p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/about" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                About Us
              </Link>
              <Link to="/packages" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Investment Packages
              </Link>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Contact Us
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Services</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/dashboard/network" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Network Marketing
              </Link>
              <Link to="/dashboard/commissions" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Commission Structure
              </Link>
              <Link to="/dashboard/packages" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Investment Plans
              </Link>
              <Link to="/dashboard/withdrawals" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Withdrawals
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/support" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Help Center
              </Link>
              <Link to="/support/tickets" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Support Tickets
              </Link>
              <Link to="/faq" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 mt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link to="/terms" className="text-sm text-gray-600 hover:text-[#0095E7]">
                Terms
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-[#0095E7]">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
