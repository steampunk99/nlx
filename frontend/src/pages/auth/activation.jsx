"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star, CheckCircle2, Sparkles, ArrowRight, Shield, Zap, Trophy } from "lucide-react"
import { usePackages } from "@/hooks/payments/usePackages"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/auth/useAuth"
import { useNavigate } from "react-router-dom"
import { BorderTrail } from "@/components/ui/border-trail"
import { useCountry } from "@/hooks/config/useCountry"
import ReactCountryFlag from "react-country-flag"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
  hover: {
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
    },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
}

const packageFeatures = [
  "Lifetime access",
  "40% Direct Referral Commission",
  "10% Level 2 Commission",
  "5% Level 3 Commission",
  "2% Level 4 Commission",
  "2% Level 5 Commission",
  "2% Level 6 Commission",
  "Unlimited referrals",
]

// Feature icons mapping
const featureIcons = {
  "Lifetime access": Shield,
  "40% Direct Referral Commission": Zap,
  "10% Level 2 Commission": CheckCircle2,
  "5% Level 3 Commission": CheckCircle2,
  "2% Level 4 Commission": CheckCircle2,
  "2% Level 5 Commission": CheckCircle2,
  "2% Level 6 Commission": CheckCircle2,
  "Unlimited referrals": Trophy,
}

export default function ActivationPage() {
  const navigate = useNavigate()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const { country, currency, formatAmount } = useCountry()
  const { user } = useAuth()

  const { availablePackages, userPackage, packagesLoading, purchasePackage } = usePackages()

  const handlePackagePurchase = (pkg) => {
    if (user.country === "UG") {
      setTimeout(() => {
        navigate("/activate/payment", { state: { selectedPackage: pkg } })
      }, 1000)
    } else {
      setTimeout(() => {
        navigate("/manual-payment", { state: { selectedPackage: pkg } })
      }, 1000)
    }
  }

  if (packagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f8f5]">
        <div className="relative">
          <BorderTrail className="h-32 w-32" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-[#2c5f63] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f5] text-[#2c2c2c]">
      {/* Clean, minimal hero section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative overflow-hidden bg-[#f8f8f5] mt-12 p-8 md:p-16 border-b border-[#2c5f63]/10"
      >
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            <h1
              className="text-4xl sm:text-6xl font-bold text-[#2c2c2c] mb-6 text-center tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="text-[#2c5f63]">Activate</span> Your Account
            </h1>

            <p
              className="text-xl md:text-2xl text-[#2c2c2c]/70 max-w-2xl mx-auto leading-relaxed text-center"
              style={{ letterSpacing: "0.01em" }}
            >
              Choose your subscription package to begin earning commissions today.
            </p>
          </motion.div>

       
         
        </div>
      </motion.div>

      {/* Premium Benefits Section - Improved cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="max-w-6xl mx-auto py-16 px-4 sm:px-6"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[#2c5f63]">Premium Benefits</h2>
          <p className="text-[#2c2c2c]/70 max-w-2xl mx-auto">
            Your subscription includes these powerful features to maximize your earning potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: "Lifetime Access",
              description: "One-time payment for permanent access to our platform",
            },
            {
              icon: Zap,
              title: "Multi-Level Commissions",
              description: "Earn from your direct referrals and their network",
            },
            {
              icon: Trophy,
              title: "Unlimited Referrals",
              description: "No cap on how many people you can refer",
            },
            {
              icon: Sparkles,
              title: "Instant Rewards",
              description: "Commissions are credited to your account immediately",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="bg-white rounded-lg p-6 hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
            >
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2c5f63] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-[#2c5f63]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="rounded-full bg-[#2c5f63]/10 w-12 h-12 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#2c5f63]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#2c2c2c]">{feature.title}</h3>
                <p className="text-[#2c2c2c]/70 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Available Package - Centered and Enhanced */}
      <div id="packages-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 bg-[#2c5f63]/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-[#2c5f63]">Your Subscription Package</h2>
          <p className="text-[#2c2c2c]/70 max-w-2xl mx-auto">
            Select this package to activate your account and start earning today.
          </p>
        </motion.div>

        <motion.div className="flex justify-center" variants={containerVariants} initial="hidden" animate="visible">
          {availablePackages.length > 0 && (
            <motion.div variants={cardVariants} whileHover="hover" className="relative group max-w-lg w-full">
              {/* Enhanced package card */}
              <Card className="overflow-hidden relative rounded-lg border-2 border-[#2c5f63]/20 bg-white shadow-lg hover:shadow-xl transition-all duration-500">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#2c5f63]"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#2c5f63]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2c5f63]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                {/* Subtle background pattern */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232c5f63' fillOpacity='0.4' fillRule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: "20px 20px",
                  }}
                />

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-3xl font-bold text-[#2c2c2c] flex items-center gap-2">
                        {availablePackages[0].name}
                        <div className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-medium rounded-full bg-[#2c5f63]/10 text-[#2c5f63]">
                          RECOMMENDED
                        </div>
                      </CardTitle>
                      <CardDescription className="text-base mt-1 text-[#2c2c2c]/70">
                        {availablePackages[0].description}
                      </CardDescription>
                    </div>
                    <Star className="h-6 w-6 text-[#2c5f63]" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex items-center justify-center py-4">
                    <div className="text-5xl font-bold text-[#2c5f63] flex items-center gap-3">
                      <ReactCountryFlag countryCode={country} svg className="rounded shadow-sm w-8 h-8" />
                      <span>
                        {currency.symbol} {formatAmount(availablePackages[0].price)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {packageFeatures.map((feature, i) => {
                      const Icon = featureIcons[feature] || CheckCircle2
                      return (
                        <div key={i} className="flex items-start gap-3 group/item">
                          <div className="rounded-full p-1.5 transition-colors bg-[#2c5f63]/10">
                            <Icon className="h-4 w-4 text-[#2c5f63]" />
                          </div>
                          <span className="text-sm text-[#2c2c2c]/80">{feature}</span>
                        </div>
                      )
                    })}
                  </div>

                  {availablePackages[0]?.benefits && typeof availablePackages[0]?.benefits === "string" && (
                    <div className="pt-4 border-t border-[#2c5f63]/10">
                      <h4 className="font-medium mb-3 text-[#2c2c2c]">Additional Benefits</h4>
                      <div className="space-y-3">
                        {JSON.parse(availablePackages[0]?.benefits)?.features?.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div className="rounded-full p-1 transition-colors bg-[#2c5f63]/10">
                              <Check className="h-4 w-4 text-[#2c5f63]" />
                            </div>
                            <span className="text-sm text-[#2c2c2c]/80">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full h-12 transition-all font-medium bg-[#2c5f63] hover:bg-[#1e4245] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    onClick={() => handlePackagePurchase(availablePackages[0])}
                  >
                    <span className="flex items-center gap-2">
                      Activate Your Account <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* FAQ Section - Cleaner design */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="max-w-4xl mx-auto py-16 px-4 sm:px-6"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[#2c5f63]">Frequently Asked Questions</h2>
          <p className="text-[#2c2c2c]/70">Find answers to common questions about our subscription package.</p>
        </div>

        <div className="space-y-6">
          {[
            {
              question: "How do commissions work?",
              answer:
                "You earn commissions on multiple levels. 40% on direct referrals, 10% on level 2, 5% on level 3, and 2% on levels 4-6.",
            },
            {
              question: "Is this a one-time payment?",
              answer: "Yes, all our packages are one-time payments that give you lifetime access to our platform.",
            },
            {
              question: "How do I get paid?",
              answer:
                "Commissions are automatically credited to your account and can be withdrawn through our supported payment methods.",
            },
            {
              question: "Can I upgrade my package later?",
              answer: "Yes, you can upgrade to a higher package at any time by paying the difference in price.",
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="bg-white rounded-lg p-6 hover:shadow-md transition-all duration-300 relative group border border-[#2c5f63]/10"
            >
              {/* Subtle hover effect */}
              <div className="absolute left-0 top-0 h-full w-1 bg-[#2c5f63] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>

              <div className="pl-4">
                <h3 className="text-lg font-semibold mb-2 text-[#2c2c2c] group-hover:text-[#2c5f63] transition-colors duration-300">
                  {faq.question}
                </h3>
                <p className="text-[#2c2c2c]/70">{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section - Clean and minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="bg-[#2c5f63] py-16 px-4 sm:px-6 relative overflow-hidden"
      >
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fillOpacity='1' fillRule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of successful members who are already earning with our platform.
          </p>

          <Button
            size="lg"
            className="bg-white hover:bg-white/90 text-[#2c5f63] shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => document.getElementById("packages-section").scrollIntoView({ behavior: "smooth" })}
          >
            Activate Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Simple footer */}
      <div className="py-6 bg-[#f8f8f5] border-t border-[#2c5f63]/10 text-center text-[#2c2c2c]/60 text-sm">
        © {new Date().getFullYear()} • All rights reserved
      </div>
    </div>
  )
}
