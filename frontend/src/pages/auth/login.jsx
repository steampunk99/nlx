import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Mail, Lock, Loader, Loader2, LockOpen } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

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
    <div className="auth-layout min-h-screen">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Background Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1579226905180-636b76d96082?q=80&w=2574&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 auth-gradient backdrop-blur-[2px]" />
          
          {/* Content Overlay */}
          <div className="relative z-10 p-12 flex flex-col justify-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8 max-w-lg mx-auto"
            >
              <div>
                <h1 className="text-5xl font-bold mb-4">Welcome Back!</h1>
                <p className="text-xl text-white/90">Sign in to continue your journey with Earn Drip</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Access your personalized dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Track your earnings and network growth</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Connect with your team members</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex items-center justify-center px-4 py-20 lg:px-12 relative z-10"
        >
          <div className="w-full max-w-md">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight premium-text-gradient">Sign In</h2>
              <p className="text-gray-400">Enter your credentials to continue</p>
            </div>

            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md p-3 text-sm"
              >
                {isError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="pl-10 bg-gray-900/50 border-gray-800 text-gray-100 focus:border-emerald-500 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="pl-10 bg-gray-900/50 border-gray-800 text-gray-100 focus:border-emerald-500 placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-emerald-400 hover:text-emerald-300">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 premium-button",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In
                    <LockOpen className="ml-2 h-5 w-5 " />
                  </span>
                )}
              </Button>

              <p className="text-center text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
