import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative border-t border-gray-200 py-10 bg-white"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100" />
      <div className="relative container mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-teal-600">
              Zillionaire
            </Link>
            <p className="mt-2 text-center text-sm text-gray-600 md:text-left">
              Empowering your financial journey.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            <Link to="/about" className="text-sm text-gray-600 hover:text-teal-600">
              About Us
            </Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-teal-600">
              Contact
            </Link>
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-teal-600">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-teal-600">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500">
          {new Date().getFullYear()} Zillionaire. All rights reserved.
        </div>
      </div>
    </motion.footer>
  )
}
