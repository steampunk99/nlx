import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Mail, Lock } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from '../../hooks/useAuth'

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, isError, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      await login({
        email: formData.get('email'),
        password: formData.get('password')
      })
      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container relative min-h-screen grid lg:grid-cols-2 items-center gap-8 pt-16 pb-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="space-y-6">
              <div className="relative">
                <div>
                  <h1 className="text-6xl font-bold text-gray-900">Welcome Back!</h1>
                </div>
                <p className="mt-4 text-xl text-gray-600">Sign in to continue your journey with Zillionaires</p>
              </div>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-[#0095E7]" />
                  <p>Access your personalized dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-[#0095E7]" />
                  <p>Track your earnings and network growth</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-[#0095E7]" />
                  <p>Connect with your team members</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="mx-auto w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign In</h2>
              <p className="text-gray-600">Enter your credentials to continue</p>
            </div>

            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm"
              >
                {error?.message || 'Login failed. Please try again.'}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="pl-10 bg-white border-gray-200 focus:border-[#0095E7] text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="pl-10 bg-white border-gray-200 focus:border-[#0095E7] text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#0095E7] hover:text-[#33ABED]"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0095E7] hover:bg-[#33ABED] text-white transition-colors"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#0095E7] hover:text-[#33ABED]"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
