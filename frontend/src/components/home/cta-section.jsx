import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-[#0095E7]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0095E7_0%,#0077B6_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-white sm:text-5xl"
            >
              Start your journey to financial freedom today
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-6 text-lg leading-8 text-white/90 max-w-2xl"
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
                className="bg-white text-[#0095E7] hover:bg-white/90 transition-colors"
                asChild
              >
                <Link to="/register">
                  <span className="inline-flex items-center gap-2">
                    Get Started Now
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-black border-white hover:bg-white/10"
                asChild
              >
                <Link to="/dashboard/packages">
                  View Packages
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-3xl" />
    </section>
  )
}
