// frontend/src/pages/auth/payments.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePackages } from '../../hooks/usePackages';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../hooks/useAuth';
import { PaymentMethodSelector } from '../../pages/dashboard/packages/payment-method-btn';
import { PaymentSummary } from '../../pages/dashboard/packages/payment-summary';
import { PaymentStatusModal, PAYMENT_STATES } from '@/components/payment/PaymentStatusModal';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState('MTN_MOBILE');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { purchasePackageMutation } = usePackages({ 
    onPaymentStatusChange: handlePaymentStatusChange 
  });

  const selectedPackage = location.state?.selectedPackage;

  function handlePaymentStatusChange(status) {
    setPaymentStatus(status);
    if (status === PAYMENT_STATES.SUCCESS) {
      toast.success('Payment successful! Redirecting to dashboard...');
    } else if (status === PAYMENT_STATES.FAILED) {
      toast.error('Payment failed. Please try again.');
      setIsSubmitting(false);
    } else if (status === PAYMENT_STATES.TIMEOUT) {
      toast.error('Payment timed out. Please try again.');
      setIsSubmitting(false);
    }
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const confirmPurchase = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your mobile money number');
      return;
    }

    const ugandaPhoneRegex = /^(0|\+?256)?(7[0-9]{8})$/;
    if (!ugandaPhoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid Ugandan mobile number');
      return;
    }

    try {
      setIsSubmitting(true);
      setShowStatusModal(true);
      
      const trans_id = `TRA${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const paymentData = {
        trans_id,
        packageId: selectedPackage.id,
        amount: selectedPackage.price,
        phone: phoneNumber
      };
      
      await purchasePackageMutation.mutateAsync(paymentData);
      
    } catch (error) {
      setPaymentStatus(PAYMENT_STATES.FAILED);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if ([PAYMENT_STATES.FAILED, PAYMENT_STATES.SUCCESS, PAYMENT_STATES.TIMEOUT].includes(paymentStatus)) {
      setShowStatusModal(false);
      setPaymentStatus(null);
    }
  };

  const handleTimeout = () => {
    setPaymentStatus(PAYMENT_STATES.TIMEOUT);
    toast('You can close this window. We\'ll notify you when the payment completes.');
  };

  if (!selectedPackage) {
    return <div>No package selected. Please select a package first.</div>;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <div className="max-w-lg mx-auto my-auto">
        <h1 className="text-2xl font-semibold mb-4">Payment for {selectedPackage.name}</h1>
        
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
          <PaymentSummary selectedPackage={selectedPackage} />
        </div>

        <div className="mt-6">
          <Button 
            className="w-full"
            onClick={confirmPurchase} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </div>

        <PaymentStatusModal 
          isOpen={showStatusModal}
          status={paymentStatus}
          onClose={handleCloseModal}
          onTimeout={handleTimeout}
        />
      </div>
    </div>
  );
}