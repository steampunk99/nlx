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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left side - Welcome text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:w-1/2 text-center lg:text-left"
        >
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            Join Zillionaires
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Start your journey to financial freedom. Join our community of successful entrepreneurs and build your network marketing empire.
          </p>
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
            <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
              <Building2 className="w-8 h-8 mb-2 text-blue-400" />
              <h3 className="font-semibold mb-1">Global Network</h3>
              <p className="text-sm text-gray-400">Connect with partners worldwide</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
              <User2 className="w-8 h-8 mb-2 text-teal-400" />
              <h3 className="font-semibold mb-1">Personal Growth</h3>
              <p className="text-sm text-gray-400">Learn and earn together</p>
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
          <div className="bg-gray-800/30 p-8 rounded-2xl backdrop-blur-sm border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
            
            {(isError || submitError) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                {submitError || error?.message || 'Registration failed. Please try again.'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className={cn(
                      "bg-gray-900/50 border-gray-700 focus:border-blue-500",
                      formErrors.firstName && "border-red-500"
                    )}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className={cn(
                      "bg-gray-900/50 border-gray-700 focus:border-blue-500",
                      formErrors.lastName && "border-red-500"
                    )}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className={cn(
                    "bg-gray-900/50 border-gray-700 focus:border-blue-500",
                    formErrors.email && "border-red-500"
                  )}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-gray-900/50 border-gray-700 focus:border-blue-500",
                    formErrors.password && "border-red-500"
                  )}
                />
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {typeof formErrors.password === 'object' && formErrors.password.map((error, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {validatePassword(formData.password).includes(error) ? (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        )}
                        <span className={validatePassword(formData.password).includes(error) ? "text-red-500" : "text-green-500"}>
                          {error}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-gray-900/50 border-gray-700 focus:border-blue-500",
                    formErrors.confirmPassword && "border-red-500"
                  )}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+256 700 000000"
                  className="bg-gray-900/50 border-gray-700 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                  defaultValue="1"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, position: parseInt(value) }))}
                  className="grid grid-cols-2 gap-4 pt-2"
                >
                  <div>
                    <RadioGroupItem
                      value="1"
                      id="distributor"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="distributor"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-900/50 p-4 hover:bg-gray-800/50 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                    >
                      <Building2 className="mb-2 h-6 w-6 text-blue-400" />
                      <span>Distributor</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="2"
                      id="customer"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="customer"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gray-700 bg-gray-900/50 p-4 hover:bg-gray-800/50 peer-data-[state=checked]:border-teal-500 [&:has([data-state=checked])]:border-teal-500 cursor-pointer"
                    >
                      <User2 className="mb-2 h-6 w-6 text-teal-400" />
                      <span>Customer</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    handleChange({ target: { name: 'acceptTerms', type: 'checkbox', checked }})
                  }
                  className={cn(
                    formErrors.acceptTerms && "border-red-500"
                  )}
                />
                <Label htmlFor="acceptTerms" className="text-sm text-gray-400">
                  I accept the{' '}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                    terms and conditions
                  </Link>
                </Label>
              </div>
              {formErrors.acceptTerms && (
                <p className="text-sm text-red-500 mt-1">{formErrors.acceptTerms}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
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
