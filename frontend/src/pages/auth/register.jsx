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
import bg from '@/assets/bg.jpg'

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
                <h1 className="text-5xl font-mono font-semibold mb-4 tracking-tight">Join {siteName}</h1>
                <p className="text-xl text-white/90">Invest in minerals with a calm, transparent experience.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Daily accruals on curated mineral packages</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <p className="text-white/90">Fast, reliable withdrawals</p>
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
              <h2 className="text-3xl font-mono font-semibold tracking-tight text-stone-900">Create Account</h2>
              <p className="text-stone-600">Join Mineral Traders to start investing</p>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm"
              >
                {submitError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-stone-700">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className={cn(
                      "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none",
                      formErrors.firstName && "border-red-500/50"
                    )}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-stone-700">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className={cn(
                      "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none",
                      formErrors.lastName && "border-red-500/50"
                    )}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  required
                  className={cn(
                    "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none",
                    formErrors.email && "border-red-500/50"
                  )}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Country Selection */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-stone-700">Country</Label>
                <Select 
                  
                  name="country"
                  value={formData.country}
                  onValueChange={(value) => handleChange({ target: { name: 'country', value } })}
                >
                  <SelectTrigger className="bg-white border border-stone-300 text-stone-900 focus:ring-amber-500/20 focus:border-amber-600 focus:outline-none">
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
                  <p className="text-sm text-red-600">{formErrors.country}</p>
                )}
              </div>

              {/* Phone Number with country detection */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-stone-700">Phone Number</Label>
                <PhoneInput
                  international
                  defaultCountry={formData.country || 'UG'}
                  value={formData.phone}
                  onChange={(value) => handleChange({ target: { name: 'phone', value } })}
                  className="flex h-12 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-500/20"
                />
                {formErrors.phone && (
                  <Badge variant="secondary" >{formErrors.phone}</Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none",
                    formErrors.password && "border-red-500/50"
                  )}
                />
                {formErrors.password && Array.isArray(formErrors.password) && (
                  <div className="mt-2 space-y-1">
                    {formErrors.password.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {error.includes('✓') ? (
                          <Check className="w-4 h-4 text-amber-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                        <span className={error.includes('✓') ? 'text-amber-700' : 'text-red-600'}>
                          {error}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-stone-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none",
                    formErrors.confirmPassword && "border-red-500/50"
                  )}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-stone-700">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Enter referral code"
                  className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none"
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
                  className="border-stone-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-stone-700"
                >
                  I accept the <Link to="/terms" className="text-amber-700 hover:text-amber-800">terms and conditions</Link>
                </label>
              </div>
              {formErrors.acceptTerms && (
                <p className="text-sm text-red-600">{formErrors.acceptTerms}</p>
              )}

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

              <p className="text-center text-stone-600">
                Already have an account?{" "}
                <Link to="/login" className="text-amber-700 hover:text-amber-800 font-medium">
                  Sign in
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
