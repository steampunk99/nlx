import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronRight } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useNavigate, Link } from "react-router-dom"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"

const LoginPage = () => {
  const [accountType, setAccountType] = useState("distributor")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add login logic here
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container relative min-h-screen grid lg:grid-cols-2 items-center gap-8 pt-16 pb-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-zinc-400">Choose your account type to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <RadioGroup
                defaultValue={accountType}
                onValueChange={setAccountType}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="distributor"
                    id="distributor"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="distributor"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Distributor
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="customer"
                    id="customer"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="customer"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Customer
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                  className="bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  required
                  type="password"
                  className="bg-transparent"
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
                type="submit"
              >
                Sign In
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="mt-4 text-center text-sm">
                <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>

              <div className="mt-6 text-center text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Testimonial/Info Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg opacity-10 blur-xl" />
          <div className="relative bg-zinc-900 rounded-lg p-8 space-y-6">
            <blockquote className="text-lg font-medium">
              "Join our thriving community of successful entrepreneurs and unlock your potential in the world of network marketing."
            </blockquote>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-zinc-800" />
              <div>
                <div className="font-medium">Sarah Johnson</div>
                <div className="text-zinc-400 text-sm">Top Distributor</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
