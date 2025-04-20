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
      <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <div className="relative">
          <BorderTrail className="h-32 w-32" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      {/* Hero Section with Animated Background */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative overflow-hidden rounded-b-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 p-8 md:p-16"
      >
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />

        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute -top-8 -right-8 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl opacity-50" />

        <BorderTrail
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 10%), 0 0 100px 60px rgb(0 0 0 / 10%)",
          }}
          size={200}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary animate-text-gradient bg-300% mb-6">
              Unlock Your Potential
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Choose a subscription package to activate your account and start earning commissions today.
            </p>
          </motion.div>

        
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="max-w-6xl mx-auto py-16 px-4 sm:px-6"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Premium Benefits</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
            { icon: Trophy, title: "Unlimited Referrals", description: "No cap on how many people you can refer" },
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
              className="bg-gradient-to-br from-background to-primary/5 border border-primary/10 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
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
          <h2 className="text-3xl font-bold mb-4">Choose Your Package</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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

            return (
              <motion.div key={pkg.id} variants={cardVariants} whileHover="hover" className="relative group h-full">
                {isPremium && (
                  <div className="absolute -top-5 left-0 right-0 z-10 flex justify-center">
                    <div className="px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 via-primary to-purple-500 text-white shadow-lg flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      MOST POPULAR
                      <Star className="h-3 w-3" />
                    </div>
                  </div>
                )}

                <Card
                  className={cn(
                    "h-full transition-all duration-500 overflow-hidden relative",
                    isPremium
                      ? "bg-gradient-to-br from-purple-500/10 via-primary/5 to-purple-500/10 hover:shadow-[0_0_40px_8px_rgba(124,58,237,0.2)] border-purple-500/20"
                      : "hover:shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-background",
                    isAlreadyPurchased && "opacity-50",
                  )}
                >
                  {isPremium && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-primary to-purple-500" />
                  )}

                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />

                  <CardHeader className={cn(isPremium && "pt-8")}>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                      {isPremium && <Star className="h-6 w-6 text-yellow-500 animate-pulse" />}
                    </div>
                    <CardDescription className="text-base mt-1">{pkg.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <div
                        className={cn(
                          "text-4xl font-bold",
                          isPremium
                            ? "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-primary to-purple-500"
                            : "bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <ReactCountryFlag countryCode={country} svg className="rounded shadow-sm" />
                          <span>
                            {currency.symbol} {formatAmount(pkg.price)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                    </div>

                    <div className="space-y-3">
                      {packageFeatures.map((feature, i) => {
                        const Icon = featureIcons[feature] || CheckCircle2
                        return (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div
                              className={cn(
                                "rounded-full p-1.5 transition-colors",
                                isPremium
                                  ? "bg-purple-500/10 group-hover/item:bg-purple-500/20"
                                  : "bg-primary/10 group-hover/item:bg-primary/20",
                              )}
                            >
                              <Icon className={cn("h-4 w-4", isPremium ? "text-purple-500" : "text-primary")} />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        )
                      })}
                    </div>

                    {benefits.features?.length > 0 && (
                      <div className="pt-4 border-t border-primary/10">
                        <h4 className="font-medium mb-3">Additional Benefits</h4>
                        <div className="space-y-3">
                          {benefits.features?.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3 group/item">
                              <div
                                className={cn(
                                  "rounded-full p-1 transition-colors",
                                  isPremium
                                    ? "bg-purple-500/10 group-hover/item:bg-purple-500/20"
                                    : "bg-primary/10 group-hover/item:bg-primary/20",
                                )}
                              >
                                <Check className={cn("h-4 w-4", isPremium ? "text-purple-500" : "text-primary")} />
                              </div>
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-4">
                    <Button
                      className={cn(
                        "w-full h-12 transition-all font-medium text-white",
                        isPremium
                          ? "bg-gradient-to-r from-purple-500 via-primary to-purple-500 hover:opacity-90"
                          : "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90",
                        "shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300",
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

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="max-w-4xl mx-auto py-16 px-4 sm:px-6"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Find answers to common questions about our subscription packages.</p>
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
              className="bg-gradient-to-br from-background to-primary/5 border border-primary/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 py-16 px-4 sm:px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground/90 max-w-2xl mx-auto mb-8">
            Join thousands of successful members who are already earning with our platform.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => document.getElementById("packages-section").scrollIntoView({ behavior: "smooth" })}
          >
            Choose Your Package <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>

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
        
        .bg-grid-white\/10 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M0 0h1v1H0zM19 0h1v1h-1zM0 19h1v1H0zM19 19h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E");
          background-position: center;
          background-repeat: repeat;
        }
      `}</style>
    </div>
  )
}
