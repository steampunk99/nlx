"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronRight, Info, Users, User, Sparkles } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useNavigate, Link } from "react-router-dom"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"

const RegisterPage = () => {
  const [accountType, setAccountType] = useState("distributor")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add registration logic here
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced background with multiple gradients and patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-white via-white to-orange-50/30" />
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_85%,rgba(59,130,246,0.08)_95%,transparent_98%),linear-gradient(45deg,transparent_85%,rgba(236,72,153,0.08)_95%,transparent_98%)]" />
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="container relative min-h-screen grid lg:grid-cols-2 items-center gap-8 pt-16 pb-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border-teal-600 border px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-teal-500/10 to-orange-500/10 text-black">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Join Our Community
              </span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">Create an Account</h1>
              <p className="text-gray-600">Choose your account type to get started</p>
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
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white/50 backdrop-blur-sm p-4 hover:bg-white hover:border-teal-500/50 transition-colors peer-data-[state=checked]:border-teal-500 [&:has([data-state=checked])]:border-teal-500"
                  >
                    <Users className="mb-3 h-6 w-6 text-teal-600" />
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
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white/50 backdrop-blur-sm p-4 hover:bg-white hover:border-teal-500/50 transition-colors peer-data-[state=checked]:border-teal-500 [&:has([data-state=checked])]:border-teal-500"
                  >
                    <User className="mb-3 h-6 w-6 text-teal-600" />
                    Customer
                  </Label>
                </div>
              </RadioGroup>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  required
                  type="tel"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              {accountType === "distributor" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sponsorId" className="text-gray-700">Sponsor ID</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter your sponsor's ID if you were referred</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="sponsorId"
                    placeholder="Optional"
                    className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700">Country</Label>
                <Select>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    {/* Add more countries */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  required
                  type="password"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <Button
                className="w-full relative group overflow-hidden bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600"
                type="submit"
              >
                <span className="absolute inset-0 bg-white/10 group-hover:scale-x-100 scale-x-0 origin-left transition-transform duration-500" />
                <span className="relative inline-flex items-center gap-2 text-white">
                  Create Account
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign in
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
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-orange-500/20 rounded-2xl opacity-10 blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 space-y-6 border border-gray-200">
            <blockquote className="text-xl font-medium text-gray-900">
              "Join our thriving community of successful entrepreneurs and unlock your potential in the world of network marketing."
            </blockquote>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-500 to-orange-500" />
              <div>
                <div className="font-medium text-gray-900">Sarah Johnson</div>
                <div className="text-gray-500 text-sm">Top Distributor</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-teal-500/20 via-teal-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-bl from-orange-500/20 via-orange-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-gradient-to-b from-teal-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl" />
    </div>
  )
}

export default RegisterPage
