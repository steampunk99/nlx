import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { ChevronRight, Loader2, Building2, User2, Check, X } from 'lucide-react'
import { cn } from "../../lib/utils"
import { trackReferralClick } from '../../services/tracking.service'

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { toast } from '../../components/ui/use-toast'

// List of countries
const countries = [
  "Uganda", "Kenya", "Tanzania", "Rwanda", "Burundi", "South Sudan", 
  "Nigeria", "Ghana", "South Africa", "Ethiopia", "Other"
]

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  
  // Track referral click when page loads
  useEffect(() => {
    if (referralCode) {
      trackReferralClick(referralCode)
    }
  }, [referralCode])

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
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
      toast({
        title: 'Success',
        description: 'Registration successful'
      })
      console.log('Registration successful')
    } catch (err) {
      console.error('Registration failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      setSubmitError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage
      })
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left side - Welcome text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:w-1/2 text-center lg:text-left"
        >
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900">
            Join Zillionaires
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Start your journey to financial freedom. Join our community of successful entrepreneurs and build your network marketing empire.
          </p>
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
              <Building2 className="w-8 h-8 mb-2 text-[#0095E7]" />
              <h3 className="font-semibold mb-1 text-gray-900">Global Network</h3>
              <p className="text-sm text-gray-600">Connect with partners worldwide</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
              <User2 className="w-8 h-8 mb-2 text-[#0095E7]" />
              <h3 className="font-semibold mb-1 text-gray-900">Personal Growth</h3>
              <p className="text-sm text-gray-600">Learn and earn together</p>
            </div>
          </div>
        </motion.div>

        {/* Right side - Registration form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:w-1/2 w-full max-w-md"
        >
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Create Your Account</h2>
            
            {(isError || submitError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {submitError || error?.message || 'Registration failed. Please try again.'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className={cn(
                      "bg-white border-gray-200 focus:border-[#0095E7] text-gray-900",
                      formErrors.firstName && "border-red-300"
                    )}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className={cn(
                      "bg-white border-gray-200 focus:border-[#0095E7] text-gray-900",
                      formErrors.lastName && "border-red-300"
                    )}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  required
                  className={cn(
                    "bg-white border-gray-200 focus:border-[#0095E7] text-gray-900",
                    formErrors.email && "border-red-300"
                  )}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+256 700 000000"
                  required
                  className="bg-white border-gray-200 focus:border-[#0095E7] text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-white border-gray-200 focus:border-[#0095E7] text-gray-900",
                    formErrors.password && "border-red-300"
                  )}
                />
                {formErrors.password && Array.isArray(formErrors.password) && (
                  <div className="mt-2 space-y-1">
                    {formErrors.password.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {error.includes('✓') ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={error.includes('✓') ? 'text-green-500' : 'text-red-600'}>
                          {error}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-white border-gray-200 focus:border-[#0095E7] text-gray-900",
                    formErrors.confirmPassword && "border-red-300"
                  )}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-gray-700">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Enter referral code"
                  className="bg-white border-gray-200 focus:border-[#0095E7] text-gray-900"
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
                  className="border-gray-200 data-[state=checked]:bg-[#0095E7] data-[state=checked]:border-[#0095E7]"
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                >
                  I accept the <Link to="/terms" className="text-[#0095E7] hover:text-[#33ABED]">terms and conditions</Link>
                </label>
              </div>
              {formErrors.acceptTerms && (
                <p className="text-sm text-red-600">{formErrors.acceptTerms}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0095E7] hover:bg-[#33ABED] text-white transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-[#0095E7] hover:text-[#33ABED]">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
