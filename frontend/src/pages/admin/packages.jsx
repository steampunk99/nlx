// pages/dashboard/packages.jsx
import { useState } from 'react'
import { usePackages } from '@/hooks/usePackages'
import { PackageHeader } from './packages/PackageHeader'
import { StatsSection } from './packages/StatsSection'
import { PackageCard } from './packages/PackageCard'
import { PaymentDialog } from './packages/PaymentDialog'
import { motion } from 'framer-motion'

export default function PackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentMethodError, setPaymentMethodError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    
    const ugandaPhoneRegex = /^(0|\+?256)?(7[0-9]{8})$/
    if (!ugandaPhoneRegex.test(phoneNumber)) {
      setPaymentMethodError('Please enter a valid Ugandan mobile number')
      return false
    }

    return true
  }

  const confirmPurchase = async () => {
    if (paymentMethod === 'MOBILE_MONEY' && !validateMobileMoneyPurchase()) {
      return
    }

    setIsSubmitting(true)
    try {
      await purchasePackage({
        packageId: selectedPackage.id,
        paymentMethod,
        phoneNumber
      })
      setSelectedPackage(null)
      setPaymentMethod('')
      setPhoneNumber('')
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <PackageHeader />
      <StatsSection />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {availablePackages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            isActive={activePackages?.some(p => p.id === pkg.id)}
            onPurchase={handlePackagePurchase}
          />
        ))}
      </motion.div>

      <PaymentDialog
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        selectedPackage={selectedPackage}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        paymentMethodError={paymentMethodError}
        setPaymentMethodError={setPaymentMethodError}
        onConfirmPurchase={confirmPurchase}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}