import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePackages } from '@/hooks/usePackages'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { PaymentMethodSelector } from './payment-method-btn'
import { PaymentSummary } from './payment-summary'
import { PaymentStatusModal, PAYMENT_STATES } from '@/components/payment/PaymentStatusModal'

export default function UpgradePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [paymentMethod, setPaymentMethod] = useState('MTN_MOBILE')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const { upgradePackageMutation } = usePackages({ 
    onPaymentStatusChange: setPaymentStatus 
  })

  const { currentPackage, newPackage } = location.state || {}
  
  if (!currentPackage || !newPackage) {
    return <div>Invalid upgrade request. Please select packages first.</div>
  }

  const priceDifference = newPackage.price - currentPackage.price

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
  }

  const confirmUpgrade = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your mobile money number')
      return
    }

    const ugandaPhoneRegex = /^(0|\+?256)?(7[0-9]{8})$/
    if (!ugandaPhoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid Ugandan mobile number')
      return
    }

    try {
      setIsSubmitting(true)
      setPaymentStatus(PAYMENT_STATES.WAITING)
      setShowStatusModal(true)
      
      console.group('Upgrade Payment Initiation')
      console.log('Current Package:', {
        id: currentPackage.id,
        name: currentPackage.name,
        price: currentPackage.price
      })
      console.log('New Package:', {
        id: newPackage.id,
        name: newPackage.name,
        price: newPackage.price
      })
      console.log('Phone Number:', phoneNumber)
      
      const trans_id = `UPG${Date.now()}${Math.floor(Math.random() * 1000)}`
      
      const paymentData = {
        trans_id,
        currentPackageId: currentPackage.id,
        newPackageId: newPackage.id,
        amount: priceDifference,
        phone: phoneNumber
      }
      
      console.log('Upgrade Payment Payload:', paymentData)
      
      await upgradePackageMutation.mutateAsync(paymentData)

      console.log('Upgrade payment request sent successfully')
      console.groupEnd()
      
    } catch (error) {
      console.error('Upgrade payment error:', error)
      setPaymentStatus(PAYMENT_STATES.FAILED)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    if ([PAYMENT_STATES.FAILED, PAYMENT_STATES.SUCCESS, PAYMENT_STATES.TIMEOUT].includes(paymentStatus)) {
      setShowStatusModal(false)
      setPaymentStatus(null)
    }
  }

  const handleTimeout = () => {
    setPaymentStatus(PAYMENT_STATES.TIMEOUT)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Upgrade Package</h1>
        <div className="grid gap-4 p-4 rounded-lg bg-muted/50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Current Package</p>
              <p className="font-medium">{currentPackage.name}</p>
            </div>
            <p className="text-sm">{currentPackage.price}</p>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">New Package</p>
              <p className="font-medium">{newPackage.name}</p>
            </div>
            <p className="text-sm">{newPackage.price}</p>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <p className="font-medium">Price Difference</p>
            <p className="font-bold text-primary">+{priceDifference}</p>
          </div>
        </div>
      </div>
      
      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onMethodSelect={handlePaymentMethodChange}
      />

      <div className="mt-4">
        <div className="mb-2">
          <Label>Mobile Money Number</Label>
        </div>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Enter your mobile money number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          aria-labelledby="phone-label"
          className="mt-1"
        />
      </div>

      <div className="mt-6">
        <PaymentSummary 
          amount={priceDifference} 
          isUpgrade={true}
        />
      </div>

      <div className="mt-6">
        <Button 
          className="w-full"
          onClick={confirmUpgrade} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Confirm Upgrade'}
        </Button>
      </div>

      <PaymentStatusModal 
        isOpen={showStatusModal}
        status={paymentStatus}
        onClose={handleCloseModal}
        onTimeout={handleTimeout}
      />
    </div>
  )
}
