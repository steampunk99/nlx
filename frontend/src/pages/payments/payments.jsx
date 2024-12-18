// frontend/src/pages/dashboard/PaymentPage.jsx
import React, { useState } from 'react';
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
    onPaymentStatusChange: setPaymentStatus 
  });

  const selectedPackage = location.state?.selectedPackage;

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
      setPaymentStatus(PAYMENT_STATES.WAITING);
      setShowStatusModal(true);
      
      console.group('Payment Initiation');
      console.log('Selected Package:', {
        id: selectedPackage.id,
        name: selectedPackage.name,
        price: selectedPackage.price
      });
      console.log('Phone Number:', phoneNumber);
      
      const trans_id = `TRA${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const paymentData = {
        trans_id,
        packageId: selectedPackage.id,
        amount: selectedPackage.price,
        phoneNumber: phoneNumber
      };
      
      console.log('Payment Payload:', paymentData);
      
      await purchasePackageMutation.mutateAsync(paymentData);

      console.log('Payment request sent successfully');
      console.groupEnd();

      // Don't navigate here - let the mutation handle it after successful payment
      
    } catch (error) {
     
      
      setPaymentStatus(PAYMENT_STATES.FAILED);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    // Only allow closing if payment failed or succeeded
    if ([PAYMENT_STATES.FAILED, PAYMENT_STATES.SUCCESS, PAYMENT_STATES.TIMEOUT].includes(paymentStatus)) {
      setShowStatusModal(false);
      setPaymentStatus(null);
    }
  };

  const handleTimeout = () => {
    setPaymentStatus(PAYMENT_STATES.TIMEOUT);
    // Optional: Cancel any pending payment requests here
  };

  if (!selectedPackage) {
    return <div>No package selected. Please select a package first.</div>;
  }

  return (
    <div className="max-w-lg mx-auto">
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
  );
}