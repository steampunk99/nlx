import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      {/* Header */}
    

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12 max-w-4xl"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to Triple Pride. By accessing and using our platform, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>"Platform" refers to the Triple Pride website and services</li>
              <li>"User" refers to any individual or entity using our Platform</li>
              <li>"Content" refers to all materials and information provided through the Platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-600 mb-4">
              Users must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. MLM Program Terms</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Our MLM program operates under the following guidelines:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Commission structure is clearly defined and transparent</li>
                <li>Earnings are based on actual sales and network growth</li>
                <li>No guaranteed income promises are made</li>
                <li>Compliance with all applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Conduct</h2>
            <p className="text-gray-600 mb-4">
              Users must comply with all applicable laws and regulations. Prohibited activities include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Fraudulent or deceptive practices</li>
              <li>Harassment or abuse of other users</li>
              <li>Unauthorized access to the Platform</li>
              <li>Distribution of malware or harmful content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Termination</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to terminate or suspend accounts that violate these terms or for any other reason at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We may modify these terms at any time. Continued use of the Platform constitutes acceptance of modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms of Service, please contact us at:
              <br />
              Email: support@triplepride.com
              <br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last updated: December 8, 2024
          </p>
        </div>
      </motion.div>
    </div>
  )
}
