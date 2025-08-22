import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Mail, Lock, Loader, Loader2, LockOpen } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from '../../hooks/auth/useAuth'
import toast from 'react-hot-toast'

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useSiteConfig } from '../../hooks/config/useSiteConfig'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, isError, error } = useAuth()

  const {siteName} = useSiteConfig()

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
    <div className="min-h-screen bg-stone-50">
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
              backgroundImage: `url("https://plus.unsplash.com/premium_photo-1746108793640-d866511539e3?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
            }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          
          {/* Content Overlay */}
          <div className="relative z-10 p-12 flex flex-col justify-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8 max-w-lg mx-auto"
            >
              <div>
                <h1 className="text-5xl font-mono font-semibold mb-4 tracking-tight">Welcome Back</h1>
                <p className="text-xl text-white/90">Sign in to continue your journey with {siteName}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Invest in curated minerals with daily accruals</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Fast, reliable withdrawals</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Transparent performance and reporting</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Join Mineral Traders</p>
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
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 md:p-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-mono font-semibold tracking-tight text-stone-900">Sign In</h2>
              <p className="text-stone-600">Enter your credentials to continue</p>
            </div>

            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm"
              >
                {isError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-stone-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="pl-10 bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-stone-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="pl-10 bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none"
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
                    className="h-4 w-4 rounded border-stone-300 bg-white text-amber-600 focus:ring-amber-600"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-stone-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-amber-700 hover:text-amber-800">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-lg",
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
                    <LockOpen className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>

              <p className="text-center text-stone-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-amber-700 hover:text-amber-800 font-medium">
                  Sign up
                </Link>
              </p>
            </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
