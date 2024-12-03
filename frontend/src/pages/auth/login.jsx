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
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
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
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
                  <h1 className="text-6xl font-bold">Welcome Back!</h1>
                </div>
                <p className="mt-4 text-xl text-zinc-400">Sign in to continue your journey with Zillionaires</p>
              </div>
              <div className="space-y-4 text-zinc-400">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-violet-500" />
                  <p>Access your personalized dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-violet-500" />
                  <p>Track your earnings and network growth</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-violet-500" />
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
          <div className="mx-auto w-full max-w-md space-y-8 bg-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-800">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
              <p className="text-zinc-400">Enter your credentials to continue</p>
            </div>

            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500 text-red-500 rounded-md p-3 text-sm"
              >
                {error?.message || 'Login failed. Please try again.'}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="pl-10 bg-gray-900/50 border-gray-800 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="pl-10 bg-gray-900/50 border-gray-800 focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-violet-500 hover:text-violet-400"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
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

              <div className="text-center text-sm text-zinc-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-violet-500 hover:text-violet-400"
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
