import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { ArrowRight, PlayCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
      <a href="https://github.com/steampunk99">st</a>
      {/* Main Content */}
      <div className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-full py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:py-40">
            {/* Left Column - Text Content */}
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <span className="inline-flex items-center gap-x-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-600 ring-1 ring-inset ring-teal-600/20">
                  <span>New Feature</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  <span>AI-Powered Investment Analysis</span>
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Transform Your Future with{' '}
                  <span className="relative">
                    <span className="relative z-10 bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                      Smart Investments
                    </span>
                    <span className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-600/20 to-orange-600/20" />
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-6 text-lg leading-8 text-gray-600"
              >
                Join thousands of successful investors who have already discovered the power of our AI-driven investment platform. Start your journey to financial freedom today.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-10 flex items-center gap-x-6"
              >
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-teal-500 to-orange-500 px-8 py-6 shadow-xl shadow-teal-500/20 transition-all hover:shadow-2xl hover:shadow-teal-500/30"
                  asChild
                >
                  <Link to="/register" className="flex items-center gap-x-2">
                    Start Investing Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex items-center gap-x-2 text-gray-700 hover:text-teal-600"
                  asChild
                >
                  <Link to="/#demo">
                    <PlayCircle className="h-5 w-5" />
                    Watch Demo
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-10 flex items-center gap-x-8"
              >
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://source.unsplash.com/random/100x100?face&${i}`}
                      alt={`User ${i}`}
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-baseline gap-x-1">
                    <span className="text-2xl font-bold text-gray-900">10K+</span>
                    <span className="text-sm font-semibold text-gray-600">users</span>
                  </div>
                  <p className="text-sm text-gray-600">joined last month</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow"
            >
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                {/* Main Image */}
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
                    alt="Investment Dashboard"
                    className="h-[calc(100vh-80px)] w-full rounded-2xl object-cover shadow-2xl"
                  />
                  {/* Floating Card 1 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="absolute -left-8 top-24 hidden sm:block"
                  >
                    <div className="rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-x-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-500 to-orange-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Investment Growth</p>
                          <p className="text-xs text-gray-600">+245% this year</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  {/* Floating Card 2 */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="absolute -right-8 top-32 hidden sm:block"
                  >
                    <div className="rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-x-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-teal-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">AI Predictions</p>
                          <p className="text-xs text-gray-600">98% accuracy rate</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
