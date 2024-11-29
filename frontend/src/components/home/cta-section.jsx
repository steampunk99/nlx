import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Enhanced background with multiple gradients and patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-white via-white to-orange-50/30" />
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_85%,rgba(59,130,246,0.08)_95%,transparent_98%),linear-gradient(45deg,transparent_85%,rgba(236,72,153,0.08)_95%,transparent_98%)]" />
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border-teal-600 border px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-teal-500/10 to-orange-500/10 text-black"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              Limited Time Offer
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-8 text-4xl font-bold"
            >
              Start your journey to{" "}
              <span className="bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                financial freedom
              </span>{" "}
              today
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl"
            >
              Join thousands of successful entrepreneurs who have already taken
              the first step. Don't miss out on this opportunity to transform
              your life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Button
                size="lg"
                className="relative group overflow-hidden bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600"
                asChild
              >
                <Link to="/register">
                  <span className="absolute inset-0 bg-white/10 group-hover:scale-x-100 scale-x-0 origin-left transition-transform duration-500" />
                  <span className="relative inline-flex items-center gap-2 text-white">
                    Get Started Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-gray-900 hover:text-gray-900 hover:bg-gray-100/80"
                asChild
              >
                <Link to="/#packages">
                  View Packages
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-teal-500/20 via-teal-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-bl from-orange-500/20 via-orange-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-gradient-to-b from-teal-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl" />
    </section>
  )
}
