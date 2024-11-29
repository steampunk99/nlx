import { motion } from "framer-motion"
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Award,
  HeartHandshake,
  ArrowRight
} from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"

const features = [
  {
    name: "Community Driven",
    description:
      "Join a thriving community of entrepreneurs and investors working together towards financial success.",
    icon: Users,
    stat: "50K+",
    statLabel: "Active Members"
  },
  {
    name: "Growth Focused",
    description:
      "Access proven strategies and tools designed to maximize your investment potential and accelerate wealth creation.",
    icon: TrendingUp,
    stat: "127%",
    statLabel: "Avg. Annual Growth"
  },
  {
    name: "Secure Platform",
    description:
      "Rest easy knowing your investments are protected by state-of-the-art security measures and encryption.",
    icon: Shield,
    stat: "256-bit",
    statLabel: "Encryption"
  },
  {
    name: "Fast Performance",
    description:
      "Experience lightning-fast transactions and real-time updates on your investments and returns.",
    icon: Zap,
    stat: "<100ms",
    statLabel: "Response Time"
  },
  {
    name: "Expert Support",
    description:
      "Get personalized guidance from our team of experienced financial advisors and investment specialists.",
    icon: Award,
    stat: "24/7",
    statLabel: "Support"
  },
  {
    name: "Partner Benefits",
    description:
      "Unlock exclusive rewards and bonuses as you grow your network and achieve new milestones.",
    icon: HeartHandshake,
    stat: "$2.5M+",
    statLabel: "Rewards Paid"
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function FeaturesSection() {
  return (
    <section className="relative py-24 sm:py-32" id="features">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-x-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-600 ring-1 ring-inset ring-teal-600/20"
          >
            <span>Platform Features</span>
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            <span>Built for Growth</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="mt-8 text-3xl font-bold text-white tracking-tight sm:text-5xl">
              Everything you need to{" "}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                  succeed
                </span>
                <span className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-600/20 to-orange-600/20" />
              </span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-6 text-lg leading-8 text-gray-300"
          >
            Our platform combines cutting-edge technology with expert guidance to provide you with the most comprehensive investment solution available.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <motion.div
                key={feature.name}
                variants={item}
                className="group relative flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-xl shadow-gray-900/5 ring-1 ring-gray-200 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 hover:ring-teal-500/20"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-orange-500 text-white shadow-lg shadow-teal-500/30">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold leading-8 tracking-tight text-gray-900">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-x-3 text-sm">
                  <span className="font-bold text-gray-900">{feature.stat}</span>
                  <span className="text-gray-600">{feature.statLabel}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Button
            size="lg"
            className="group relative overflow-hidden bg-gradient-to-r from-teal-500 to-orange-500 px-8 py-6 shadow-xl shadow-teal-500/20 transition-all hover:shadow-2xl hover:shadow-teal-500/30"
            asChild
          >
            <Link to="/register" className="flex items-center gap-x-2">
              Start Your Journey
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
