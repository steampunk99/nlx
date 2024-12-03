import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Check, Star, TrendingUp, Users, Network } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { usePackages } from '../../hooks/usePackages'
import { motion } from 'framer-motion'
import { Badge } from "../../components/ui/badge"
import { Label, Input } from '../../components/ui/form'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400
    }
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function PackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethodError, setPaymentMethodError] = useState('')

  const paymentMethods = [
    {
      id: 'MTN_MOBILE_MONEY',
      name: 'MTN Mobile Money',
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      ),
      description: 'Pay via MTN Mobile Money'
    },
    {
      id: 'AIRTEL_MONEY',
      name: 'Airtel Money',
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      ),
      description: 'Pay via Airtel Money'
    }
  ]

  const {
    availablePackages, 
    activePackages, 
    packagesLoading,
    purchasePackage
  } = usePackages()

  const handlePackagePurchase = (pkg) => {
    setSelectedPackage(pkg)
  }

  const validateMobileMoneyPurchase = () => {
    if (!phoneNumber) {
      setPaymentMethodError('Please enter your mobile money phone number')
      return false
    }
    
    // Basic Uganda phone number validation
    const ugandaPhoneRegex = /^(0|\+?256)?(7[0-9]{8})$/
    if (!ugandaPhoneRegex.test(phoneNumber)) {
      setPaymentMethodError('Please enter a valid Ugandan mobile number')
      return false
    }

    return true
  }

  const confirmPurchase = () => {
    if (selectedPackage && paymentMethod) {
      if (paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY') {
        if (!validateMobileMoneyPurchase()) return
      }

      purchasePackage({
        packageId: selectedPackage.id,
        paymentMethod,
        phoneNumber: paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY' 
          ? phoneNumber 
          : undefined
      })
      setSelectedPackage(null)
      setPaymentMethod('')
      setPhoneNumber('')
      setPaymentMethodError('')
    }
  }

  if (packagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-background to-muted min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Investment Packages
          </h1>
          <p className="text-muted-foreground mt-2">Choose the perfect package to start your investment journey</p>
        </div>
      </div>

      {/* Active Packages */}
      {activePackages && activePackages.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Active Packages
              </CardTitle>
              <CardDescription>Your current investment packages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-lg">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase bg-primary/5">
                    <tr>
                      <th className="px-6 py-3 text-left">Package</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Purchase Date</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activePackages.map((pkg) => (
                      <tr key={pkg.id} className="bg-card">
                        <td className="px-6 py-4 font-medium">{pkg.package.name}</td>
                        <td className="px-6 py-4">{formatCurrency(pkg.package.price)}</td>
                        <td className="px-6 py-4">{new Date(pkg.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant="success" className="bg-green-500/10 text-green-500">
                            {pkg.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Available Packages */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {availablePackages.map((pkg, index) => {
          const benefits = JSON.parse(pkg.benefits)
          return (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              whileHover="hover"
              className={`relative ${pkg.level === 4 ? 'lg:col-span-1' : ''}`}
            >
              {pkg.level === 4 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card className={`h-full overflow-hidden ${
                pkg.level === 4 ? 'border-yellow-500/50 shadow-xl shadow-yellow-500/10' : ''
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pkg.name}</span>
                    {pkg.level === 4 && <Star className="h-5 w-5 text-yellow-500" />}
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {formatCurrency(pkg.price)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">One-time investment</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                      <TrendingUp className="h-5 w-5" />
                      {benefits.referralBonusPercentage}% Referral Bonus
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(benefits).map(([key, value]) => {
                        if (key === 'referralBonusPercentage') return null
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {key}: {value}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:to-primary"
                    size="lg"
                    onClick={() => handlePackagePurchase(pkg)}
                    disabled={activePackages && activePackages.length > 0}
                  >
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Payment Method Dialog */}
      {selectedPackage && (
        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Purchase {selectedPackage.name} Package</DialogTitle>
              <DialogDescription>
                Select your payment method to complete the purchase
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={paymentMethod === method.id ? 'default' : 'outline'}
                    className="flex items-center justify-center gap-2"
                    onClick={() => {
                      setPaymentMethod(method.id)
                      setPaymentMethodError('')
                    }}
                  >
                    {method.icon()}
                    {method.name}
                  </Button>
                ))}
              </div>

              {(paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY') && (
                <div className="space-y-2">
                  <Label>Mobile Money Phone Number</Label>
                  <Input 
                    placeholder="Enter your mobile money number" 
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value)
                      setPaymentMethodError('')
                    }}
                  />
                  {paymentMethodError && (
                    <p className="text-sm text-red-500">{paymentMethodError}</p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Total Amount: {formatCurrency(selectedPackage.price)}
                </p>
                <Button 
                  onClick={confirmPurchase} 
                  disabled={!paymentMethod || 
                    (paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'AIRTEL_MONEY') && !phoneNumber
                  }
                >
                  Confirm Purchase
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
