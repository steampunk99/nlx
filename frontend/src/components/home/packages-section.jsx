import { motion } from "framer-motion"
import { Check, Sparkles, TrendingUp, Users, Clock, Shield } from "lucide-react"
import { Button } from "../ui/button"

const packages = [
  {
    name: "Starter",
    price: "$199",
    period: "One-time investment",
    highlight: "Perfect for beginners",
    stats: {
      returns: "Up to 15%",
      support: "Community",
      users: "1000+"
    },
    features: [
      "Basic investment tools",
      "Community access",
      "Weekly market insights",
      "Email support"
    ],
    icon: TrendingUp
  },
  {
    name: "Growth",
    price: "$499",
    period: "One-time investment",
    highlight: "Most Popular",
    popular: true,
    stats: {
      returns: "Up to 25%",
      support: "Priority",
      users: "5000+"
    },
    features: [
      "Advanced investment tools",
      "Priority community access",
      "Daily market insights",
      "24/7 chat support",
      "1-on-1 monthly call"
    ],
    icon: Sparkles
  },
  {
    name: "Elite",
    price: "$999",
    period: "One-time investment",
    highlight: "For serious investors",
    stats: {
      returns: "Up to 40%",
      support: "Dedicated",
      users: "500+"
    },
    features: [
      "Premium investment suite",
      "VIP community access",
      "Real-time market alerts",
      "Dedicated account manager",
      "Weekly strategy calls",
      "Custom portfolio analysis"
    ],
    icon: Shield
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function PackagesSection() {
  return (
    <section className="relative py-24 overflow-hidden" id="packages">
      {/* Enhanced background with multiple gradients and patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-orange-50/30" />
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_85%,rgba(59,130,246,0.08)_95%,transparent_98%),linear-gradient(45deg,transparent_85%,rgba(236,72,153,0.08)_95%,transparent_98%)]" />
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <span className="px-4 py-1.5 rounded-full border-teal-600 border text-sm font-medium bg-gradient-to-r from-teal-500/10 to-orange-500/10 text-black">
              Investment Packages
            </span>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
              Choose Your Investment Path
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl">
              Select the perfect investment package that aligns with your financial goals and experience level
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex space-x-6 pb-8 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.name}
              variants={cardVariants}
              className={`flex-none w-[85%] sm:w-[45%] lg:w-[32%] snap-center ${
                pkg.popular ? 'relative z-10 scale-105' : ''
              }`}
            >
              <div className={`h-full rounded-2xl p-8 backdrop-blur-sm ${
                pkg.popular
                  ? 'bg-gradient-to-b from-white to-teal-50/50 ring-2 ring-teal-500'
                  : 'bg-white/80 ring-1 ring-gray-200'
              }`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-500 to-orange-500 px-3 py-1 text-sm font-medium text-white">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{pkg.highlight}</p>
                  </div>
                  <pkg.icon className={`w-8 h-8 ${
                    pkg.popular ? 'text-teal-500' : 'text-gray-400'
                  }`} />
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                    <span className="ml-2 text-sm text-gray-500">{pkg.period}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-teal-500" />
                    <p className="text-sm font-medium text-gray-900">{pkg.stats.returns}</p>
                    <p className="text-xs text-gray-500">Returns</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <Users className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <p className="text-sm font-medium text-gray-900">{pkg.stats.users}</p>
                    <p className="text-xs text-gray-500">Active Users</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${
                        pkg.popular ? 'text-teal-500' : 'text-gray-400'
                      }`} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full relative group overflow-hidden ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <span className="absolute inset-0 bg-white/10 group-hover:scale-x-100 scale-x-0 origin-left transition-transform duration-500" />
                  <span className="relative inline-flex items-center gap-2 text-white">
                    Get Started
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-teal-500/20 via-teal-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-bl from-orange-500/20 via-orange-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-gradient-to-b from-teal-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl" />
    </section>
  )
}
