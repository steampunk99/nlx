import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/auth/useAuth'
import { ChevronRight, Loader2, Building2, User2, Check, X, LockKeyhole } from 'lucide-react'
import { cn } from "../../lib/utils"
import { trackReferralClick } from '../../services/tracking.service'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import toast from 'react-hot-toast'
import { useSiteConfig } from '../../hooks/config/useSiteConfig'
import { Badge } from '@/components/ui/badge'

// List of countries with codes
const countries = [
  { code: 'UG', name: 'Uganda' },
  { code: 'KE', name: 'Kenya' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BI', name: 'Burundi' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ET', name: 'Ethiopia' }
].sort((a, b) => a.name.localeCompare(b.name))

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const { siteName } = useSiteConfig()
  
  // Track referral click when page loads
  useEffect(() => {
    if (referralCode) {
      trackReferralClick(referralCode)
    }
  }, [referralCode])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    phone: '',
    position: 1,
    acceptTerms: false,
    referralCode: referralCode || ''  // Initialize with URL param if present
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const { register, isLoading, isError, error } = useAuth()

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) errors.push('Password must be at least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('Include at least one uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('Include at least one lowercase letter')
    if (!/[0-9]/.test(password)) errors.push('Include at least one number')
    if (!/[!@#$%^&*]/.test(password)) errors.push('Include at least one special character')
    return errors
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: newValue }))
    
    // Clear specific error when field is being edited
    setFormErrors(prev => ({ ...prev, [name]: '' }))

    // Validate password strength in real-time
    if (name === 'password') {
      const passwordErrors = validatePassword(value)
      setFormErrors(prev => ({ ...prev, password: passwordErrors.length > 0 ? passwordErrors : '' }))
    }

    // Check password confirmation match
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      if (name === 'confirmPassword' && value !== formData.password) {
        setFormErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      } else if (name === 'password' && value !== formData.confirmPassword) {
        setFormErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      } else {
        setFormErrors(prev => ({ ...prev, confirmPassword: '' }))
      }
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData.password) errors.password = validatePassword(formData.password)
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.country) errors.country = 'Country is required'
    if (!formData.phone) errors.phone = 'Phone number is required'
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const errors = validateForm()
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      console.log('Submitting registration form with data:', formData)
      const { confirmPassword, acceptTerms, ...registrationData } = formData
      await register(registrationData)
      toast.success('Registration successful')
      console.log('Registration successful')
    } catch (err) {
      console.error('Registration failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      setSubmitError(errorMessage)
      toast.error(errorMessage)
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
                <h1 className="text-5xl font-bold mb-4">Join {siteName}</h1>
                <p className="text-xl text-white/90">{siteName} is a farming  company that grows quality cocoa.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">We also pay farmers per day of the harvests</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">We have 3 Million farmers in africa.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Join the farming club</p>
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
              <h2 className="text-3xl font-bold tracking-tight premium-text-gradient">Create Account</h2>
              <p className="text-gray-400">Join our community of entrepreneurs</p>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md p-3 text-sm"
              >
                {submitError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className={cn(
                      "bg-gray-900/50 border-gray-800 text-gray-100 focus:border-emerald-500 placeholder:text-gray-500",
                      formErrors.firstName && "border-red-500/50"
                    )}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-400 mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className={cn(
                      "bg-gray-900/50 border-gray-800 text-gray-100 focus:border-emerald-500 placeholder:text-gray-500",
                      formErrors.lastName && "border-red-500/50"
                    )}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-400 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  required
                  className={cn(
                    "bg-gray-900/50 border-gray-800 text-gray-100 focus:border-emerald-500 placeholder:text-gray-500",
                    formErrors.email && "border-red-500/50"
                  )}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-400 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Country Selection */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select 
                  
                  name="country"
                  value={formData.country}
                  onValueChange={(value) => handleChange({ target: { name: 'country', value } })}
                >
                  <SelectTrigger className="bg-gray-900 border-none  text-white">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.country && (
                  <p className="text-sm text-red-500">{formErrors.country}</p>
                )}
              </div>

              {/* Phone Number with country detection */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneInput
                  international
                  defaultCountry={formData.country || 'UG'}
                  value={formData.phone}
                  onChange={(value) => handleChange({ target: { name: 'phone', value } })}
                  className="flex h-12 w-full rounded-md border border-gray-800 bg-gray-900/50 px-3 py-2 
                  text-sm "
                />
                {formErrors.phone && (
                  <Badge variant="secondary" >{formErrors.phone}</Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-gray-900/50 border-gray-800 text-gray-100 focus:border-emerald-500 placeholder:text-gray-500",
                    formErrors.password && "border-red-500/50"
                  )}
                />
                {formErrors.password && Array.isArray(formErrors.password) && (
                  <div className="mt-2 space-y-1">
                    {formErrors.password.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {error.includes('✓') ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        <span className={error.includes('✓') ? 'text-emerald-400' : 'text-red-400'}>
                          {error}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-gray-900/50 border-gray-800 text-gray-100 focus:border-emerald-500 placeholder:text-gray-500",
                    formErrors.confirmPassword && "border-red-500/50"
                  )}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-400 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-gray-300">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Enter referral code"
                  className="bg-gray-900/50 border-gray-800 text-gray-100 focus:border-emerald-500 placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    handleChange({ target: { name: 'acceptTerms', type: 'checkbox', checked }})
                  }
                  className="border-gray-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                >
                  I accept the <Link to="/terms" className="text-emerald-400 hover:text-emerald-300">terms and conditions</Link>
                </label>
              </div>
              {formErrors.acceptTerms && (
                <p className="text-sm text-red-400">{formErrors.acceptTerms}</p>
              )}

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
                      <Loader2 className="h-5 w-5" />
                    </motion.div>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Create Account
                    <LockKeyhole className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>

              <p className="text-center text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
