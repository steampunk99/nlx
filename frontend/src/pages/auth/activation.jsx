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
import { cn } from "@/lib/utils"
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
      <div className="flex items-center justify-center min-h-screen bg-[#f7f3eb]">
        <div className="relative">
          <BorderTrail className="h-32 w-32" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-[#c73e3a] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#2c2c2c]">
      {/* Hero Section with Japanese-inspired design */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative overflow-hidden bg-[#f7f3eb] p-8 md:p-16"
      >
        {/* Japanese wave pattern (Seigaiha) */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 25c-13.807 0-25 11.193-25 25s11.193 25 25 25 25-11.193 25-25-11.193-25-25-25zm0 5c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm0 5c-8.284 0-15 6.716-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15zm0 5c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10zm-50-15c-13.807 0-25 11.193-25 25s11.193 25 25 25 25-11.193 25-25-11.193-25-25-25zm0 5c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm0 5c-8.284 0-15 6.716-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15zm0 5c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10zm100-15c-13.807 0-25 11.193-25 25s11.193 25 25 25 25-11.193 25-25-11.193-25-25-25zm0 5c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm0 5c-8.284 0-15 6.716-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15zm0 5c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z' fill='%23c73e3a' fillOpacity='1' fillRule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Red circle (hinomaru) inspired element */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#c73e3a]/20 rounded-full filter blur-3xl opacity-50" />

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-16"
          >
            {/* Japanese-style decorative element */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-1 bg-[#c73e3a]"></div>
            </div>

            <h1
              className="text-4xl sm:text-6xl font-bold text-[#2c2c2c] mb-6 text-center tracking-tight"
              style={{ letterSpacing: "-0.05em" }}
            >
              <span className="text-[#c73e3a]">.</span>
              <span className="block text-2xl sm:text-3xl mt-2 font-normal tracking-wide">Begin Your Journey</span>
            </h1>

            <p
              className="text-xl md:text-2xl text-[#2c2c2c]/80 max-w-2xl mx-auto leading-relaxed text-center"
              style={{ letterSpacing: "0.02em" }}
            >
              Choose a subscription package to activate your account and start earning commissions today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-[#c73e3a] hover:bg-[#a02a27] text-white shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => document.getElementById("packages-section").scrollIntoView({ behavior: "smooth" })}
            >
              View Packages <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#c73e3a] text-[#c73e3a] hover:bg-[#c73e3a]/10 transition-all duration-300"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative divider */}
      <div className="relative h-24 overflow-hidden">
        <div className="absolute inset-0 flex">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-24 bg-[#c73e3a]/10"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%, 0 0)",
                marginRight: "1px",
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="max-w-6xl mx-auto py-16 px-4 sm:px-6"
      >
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-0.5 bg-[#c73e3a]"></div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-[#2c2c2c]">Premium Benefits</h2>
          <p className="text-[#2c2c2c]/70 max-w-2xl mx-auto">
            All subscription packages include these powerful features to maximize your earning potential.
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
              className="bg-white border border-[#e0d9ce] rounded-none p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle corner decoration */}
              <div className="absolute top-0 right-0 w-8 h-8">
                <div
                  className="absolute top-0 right-0 w-8 h-8 bg-[#c73e3a]/10"
                  style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                ></div>
              </div>

              <div className="rounded-full bg-[#f7f3eb] w-12 h-12 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-[#c73e3a]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#2c2c2c]">{feature.title}</h3>
              <p className="text-[#2c2c2c]/70 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Available Packages */}
      <div id="packages-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-0.5 bg-[#c73e3a]"></div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-[#2c2c2c]">Choose Your Package</h2>
          <p className="text-[#2c2c2c]/70 max-w-2xl mx-auto">
            Select the subscription that best fits your goals and budget.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {availablePackages.map((pkg, index) => {
            const benefits = typeof pkg?.benefits === "string" ? JSON.parse(pkg?.benefits) : pkg?.benefits || {}
            const isPremium = pkg.level === 4
            const isAlreadyPurchased = userPackage?.package?.id === pkg.id && userPackage.status === "ACTIVE"

            // Japanese-inspired color schemes
            const colorSchemes = [
              {
                bg: "bg-white",
                border: "border-[#e0d9ce]",
                accent: "bg-[#2c5f63]", // Indigo
                icon: "text-[#2c5f63]",
              },
              {
                bg: "bg-white",
                border: "border-[#e0d9ce]",
                accent: "bg-[#c73e3a]", // Vermilion
                icon: "text-[#c73e3a]",
              },
              {
                bg: "bg-white",
                border: "border-[#e0d9ce]",
                accent: "bg-[#b35c37]", // Burnt Sienna
                icon: "text-[#b35c37]",
              },
              {
                bg: "bg-white",
                border: "border-[#e0d9ce]",
                accent: "bg-[#927f54]", // Gold
                icon: "text-[#927f54]",
              },
            ]

            const colorScheme = colorSchemes[index % colorSchemes.length]

            return (
              <motion.div key={pkg.id} variants={cardVariants} whileHover="hover" className="relative group h-full">
                {isPremium && (
                  <div className="absolute -top-5 left-0 right-0 z-10 flex justify-center">
                    <div className="px-4 py-1 rounded-none text-xs font-semibold bg-[#927f54] text-white shadow-md flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      MOST POPULAR
                      <Star className="h-3 w-3" />
                    </div>
                  </div>
                )}

                <Card
                  className={cn(
                    "h-full transition-all duration-500 overflow-hidden relative rounded-none",
                    colorScheme.bg,
                    colorScheme.border,
                    "hover:shadow-lg",
                    isAlreadyPurchased && "opacity-50",
                  )}
                >
                  {/* Japanese-inspired decorative element */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c73e3a] to-transparent opacity-80"></div>

                  {/* Subtle pattern background */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: "60px 60px",
                    }}
                  />

                  <CardHeader className={cn(isPremium && "pt-8")}>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold text-[#2c2c2c]">{pkg.name}</CardTitle>
                      {isPremium && <Star className="h-6 w-6 text-[#927f54] animate-pulse" />}
                    </div>
                    <CardDescription className="text-base mt-1 text-[#2c2c2c]/70">{pkg.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <div className="text-4xl font-bold text-[#2c2c2c] flex items-center gap-2">
                        <ReactCountryFlag countryCode={country} svg className="rounded shadow-sm" />
                        <span>
                          {currency.symbol} {formatAmount(pkg.price)}
                        </span>
                      </div>
                      <p className="text-sm text-[#2c2c2c]/70 mt-1">One-time payment</p>
                    </div>

                    <div className="space-y-3">
                      {packageFeatures.map((feature, i) => {
                        const Icon = featureIcons[feature] || CheckCircle2
                        return (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div className={`rounded-none p-1.5 transition-colors ${colorScheme.accent}/10`}>
                              <Icon className={`h-4 w-4 ${colorScheme.icon}`} />
                            </div>
                            <span className="text-sm text-[#2c2c2c]/80">{feature}</span>
                          </div>
                        )
                      })}
                    </div>

                    {benefits.features?.length > 0 && (
                      <div className="pt-4 border-t border-[#e0d9ce]">
                        <h4 className="font-medium mb-3 text-[#2c2c2c]">Additional Benefits</h4>
                        <div className="space-y-3">
                          {benefits.features?.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3 group/item">
                              <div className={`rounded-none p-1 transition-colors ${colorScheme.accent}/10`}>
                                <Check className={`h-4 w-4 ${colorScheme.icon}`} />
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
                      className={cn(
                        "w-full h-12 transition-all font-medium rounded-none",
                        isPremium
                          ? "bg-[#927f54] hover:bg-[#7d6c48] text-white"
                          : `${colorScheme.accent} hover:opacity-90 text-white`,
                        "shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
                      )}
                      onClick={() => handlePackagePurchase(pkg)}
                      disabled={isAlreadyPurchased}
                    >
                      {isAlreadyPurchased ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Already Subscribed
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Get Started <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Japanese-inspired decorative divider */}
      <div className="flex justify-center my-8">
        <div className="flex items-center gap-2">
          <div className="w-16 h-px bg-[#c73e3a]/50"></div>
          <div className="w-2 h-2 bg-[#c73e3a]/50 transform rotate-45"></div>
          <div className="w-16 h-px bg-[#c73e3a]/50"></div>
        </div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="max-w-4xl mx-auto py-16 px-4 sm:px-6"
      >
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-0.5 bg-[#c73e3a]"></div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-[#2c2c2c]">Frequently Asked Questions</h2>
          <p className="text-[#2c2c2c]/70">Find answers to common questions about our subscription packages.</p>
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
              className="bg-white border border-[#e0d9ce] rounded-none p-6 hover:shadow-md transition-all duration-300 relative"
            >
              {/* Decorative corner element */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#c73e3a]/30"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#c73e3a]/30"></div>

              <h3 className="text-lg font-semibold mb-2 text-[#2c2c2c]">{faq.question}</h3>
              <p className="text-[#2c2c2c]/70">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section with Japanese-inspired design */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="bg-[#c73e3a]/10 py-16 px-4 sm:px-6 relative overflow-hidden"
      >
        {/* Japanese-inspired pattern background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c73e3a' fillOpacity='0.8' fillRule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-0.5 bg-[#c73e3a]"></div>
          </div>

          <h2 className="text-3xl font-bold mb-4 text-[#2c2c2c]">Ready to Start Your Journey?</h2>
          <p className="text-xl text-[#2c2c2c]/80 max-w-2xl mx-auto mb-8">
            Join thousands of successful members who are already earning with our platform.
          </p>

          <Button
            size="lg"
            className="bg-[#c73e3a] hover:bg-[#a02a27] text-white rounded-none shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => document.getElementById("packages-section").scrollIntoView({ behavior: "smooth" })}
          >
            Choose Your Package <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Japanese-inspired footer decoration */}
      <div className="h-8 bg-[#2c2c2c] flex items-center justify-center">
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Add custom styles to the head */}
      <style jsx="true" global="true">{`
        @keyframes text-gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-text-gradient {
          animation: text-gradient 8s linear infinite;
        }
        
        .bg-300\% {
          background-size: 300%;
        }
      `}</style>
    </div>
  )
}
