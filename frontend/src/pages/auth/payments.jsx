import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePackages } from '@/hooks/usePackages';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Package, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

function PaymentPage() {
  const location = useLocation();
  const { user } = useAuth();
  const selectedPackage = location.state?.selectedPackage;
  const navigate = useNavigate();

  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/payments/package', {
        amount: selectedPackage?.price,
        phone: phone,
        packageId: selectedPackage.id
      });

      if (response.data?.success && response.data?.trans_id) {
        toast.success('Payment initiated');
        navigate(`/payment-status?trans_id=${response.data.trans_id}`);
      } else {
        toast.error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPackage) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">No Package Selected</CardTitle>
            <CardDescription>Please select a package first to proceed with payment.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-gradient-to-r from-yellow-500/10 to-purple-500/10 justify-center min-h-[100vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Payment for {selectedPackage.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Complete your payment to activate your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-6">
            {/* Package Summary */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Package</span>
                <span className="font-medium">{selectedPackage.name}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-medium text-primary">UGX {selectedPackage.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Mobile Money Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your mobile money number"
                className="w-full focus:outline-none focus:ring-indigo-500 "
                required
                disabled={isSubmitting}
              />
             
            </div>

            {/* Payment Method */}
            {/* <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="font-medium">Payment Method</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Mobile Money (MTN/Airtel)
              </p>
            </div> */}
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="button"
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-green-500 to-purple-500 text-white hover:bg-gradient-to-r hover:from-yellow-600 hover:to-purple-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              `Pay UGX ${selectedPackage.price.toLocaleString()}`
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By clicking Pay, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PaymentPage;