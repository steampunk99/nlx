import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export function Footer() {
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
              Zillionaire
            </Link>
            <p className="text-sm text-gray-600">
              Empowering your financial journey through network marketing excellence.
            </p>
            <div className="flex flex-col space-y-2">
              <a href="tel:+256700000000" className="text-sm text-gray-600 hover:text-[#0095E7]">
                +256 700 000 000
              </a>
              <a href="mailto:support@zillionaire.com" className="text-sm text-gray-600 hover:text-[#0095E7]">
                support@zillionaire.com
              </a>
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
              <Link to="/faq" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                FAQ
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-[#0095E7] flex items-center">
                <ChevronRight className="h-4 w-4" />
                Terms of Service
              </Link>
             
            </div>
          </div>

          {/* Office */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Office</h3>
            <p className="text-sm text-gray-600">
              Plot 32, Lumumba Avenue<br />
              Nakasero, Kampala<br />
              Uganda
            </p>
          </div>
        </div>

        {/* Legal Information */}
        <div className="border-t border-gray-200 pt-8 space-y-8">
          <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
            {/* <p>
              Zillionaire Limited is a registered company in Uganda with registration number UC-123456. 
              The company is authorized by the Uganda Registration Services Bureau (URSB) with license number MLM/2024/001.
            </p> */}
            
            <p>
              <strong className="text-gray-900">Risk Warning:</strong> Network marketing and investment activities involve 
              risks and may not be suitable for everyone. Your capital is at risk, and past performance is not indicative 
              of future results. Under no circumstances shall Zillionaire have any liability for any loss or damage resulting 
              from reliance on the information contained herein.
            </p>

            <p>
              The services offered by Zillionaire are not available to residents of certain jurisdictions where such services 
              would be contrary to local laws and regulations. It is the responsibility of the user to ensure compliance with 
              any local laws or regulations.
            </p>

            <p>
              The information on this website does not constitute investment advice or a recommendation to join our network 
              marketing program. Any interaction with this website constitutes an individual and voluntary operation.
            </p>

            <p>
              Zillionaire maintains high standards of data security and privacy protection. We conduct regular security audits 
              and implement industry-standard protection measures to safeguard your information.
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <p>
              ¹All withdrawal requests are processed within 24-48 hours of approval.
            </p>
            <p>
              ²Commission rates and referral bonuses may vary based on package type and network level.
            </p>
            <p>
              ³Package prices and features are subject to change with notice to members.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p> {new Date().getFullYear()} Zillionaire Limited. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  )
}
