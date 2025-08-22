import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePackages } from '@/hooks/payments/usePackages';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCountry } from '@/hooks/config/useCountry';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Package, CreditCard, ArrowBigLeft, Copy, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {motion} from "framer-motion";
import ReactCountryFlag from 'react-country-flag';
import {cn} from '@/lib/utils';

function PaymentPage() {
  const location = useLocation();
  const { user } = useAuth();
  const selectedPackage = location.state?.selectedPackage;
  const navigate = useNavigate();
  const { country, currency, formatAmount } = useCountry();

  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false)

//handle copy to clipboard
const handleCopyToClipboard = () => {
  navigator.clipboard.writeText(wallet);
  setCopied(true);
  toast.success('Wallet address copied!');
  setTimeout(() => setCopied(false), 2000);
}

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/payments/package', {
        amount: selectedPackage?.price,
        phone: phone,
        packageId: selectedPackage.id,
        currency: currency.symbol
      });

      if (response.data?.success && response.data?.trans_id) {
        toast.success('Payment initiated successfully');
        setTimeout(() => {
          navigate(`/payment-status?trans_id=${response.data.trans_id}`);
        }, 3000);
      } else {
        toast.error('Failed to initiate payment, please try again');
        console.error('Payment failed:', response.data);
        setTimeout(() => {
          navigate('/activation');
        }, 3000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsdtSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/payments/usdt-payment', {
        amount: selectedPackage?.price,
        packageId: selectedPackage.id
      });

      if (response.data?.success) {
        toast.success('USDT payment initiated');
        setTimeout(() => {
          navigate(`/usdt-payment-status?trans_id=${response.data.trans_id}&amount=${selectedPackage.price}`);
        }, 1500);
      } else {
        toast.error(response.data?.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('USDT payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
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
          <CardFooter className="flex justify-center">
            <Button size="sm" onClick={() => navigate(-1)}>Go Back <ArrowBigLeft className="w-4 h-4 ml-2" /></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const wallet = "0xdac17f958d2ee523a2206206994597c13d831ec7";

  return (
    <div className="relative min-h-screen">
      {/* Washi-like subtle background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,_rgba(2,6,23,0.05)_1px,_transparent_0)] bg-[length:22px_22px]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-white/90 to-slate-50/90" />

      <div className="flex items-start justify-center pt-12 pb-16 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-light tracking-wide text-slate-900">Complete Your Activation</h1>
            <p className="text-slate-600 text-sm mt-2">Choose a payment method below. Minimal, calm, and focused.</p>
          </div>

          <Tabs defaultValue="mobile-money" className="w-full">
         <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-1 shadow-sm">
    <TabsTrigger value="mobile-money" className="rounded-md transition-all data-[state=active]:bg-amber-600 data-[state=active]:text-white">Mobile Money</TabsTrigger>
    <TabsTrigger value="usdt" className="rounded-md transition-all data-[state=active]:bg-amber-600 data-[state=active]:text-white">USDT</TabsTrigger>
  </TabsList>
  <TabsContent value="mobile-money">
      <Card className="w-full border border-slate-200/70 rounded-2xl shadow-sm bg-white/95 backdrop-blur-sm">
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
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Package</span>
                <span className="font-medium">{selectedPackage.name}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <div className="flex items-center gap-2">
                  <ReactCountryFlag countryCode={country} svg />
                  <span className="font-medium text-primary">
                    {formatAmount(selectedPackage.price)}
                  </span>
                </div>
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
                onChange={(e) => {
                  let value = e.target.value;
                  // Automatically trim +256 if present
                  if (value.startsWith('+256')) {
                    value = '0' + value.slice(4);
                  }
                  setPhone(value);
                }}
                placeholder="Enter your mobile money number"
                className="w-full bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-amber-500/20 focus:outline-none rounded-lg transition-colors"
                required
                disabled={isSubmitting}
              />
             
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="font-medium">Payment Method</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Mobile Money (MTN/Airtel)
              </p>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="button"
            onClick={handlePayment}
            className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : (
              `Pay ${formatAmount(selectedPackage.price)}`
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By clicking Pay, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </TabsContent>
    <TabsContent value="usdt">
      <Card className="w-full border border-slate-200/70 rounded-2xl shadow-sm bg-white/95 backdrop-blur-sm">
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
          <div className="space-y-6">
            {/* Package Summary */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Package</span>
                <span className="font-medium">{selectedPackage.name}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <div className="flex items-center gap-2">
                 USDT
                  <span className="font-medium text-primary">
                    {formatAmount(selectedPackage.price/3900)}
                  </span>
                </div>
              </div>
            </div>

            {/* USDT Payment Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              {/* <div className="flex justify-center">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <CreditCard className="w-16 h-16 text-primary animate-pulse" />
                </div>
              </div> */}
              
              <div className="space-y-4 text-center">
                <div>
                  <h3 className="font-medium text-lg mb-2">USDT Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Add the amount of <strong>  {formatAmount(selectedPackage.price/3900)} </strong> to the address
                  </p>
                  <div className="relative flex w-full max-w-xl mx-auto mt-2">
                    <Input
                      readOnly
                      value={wallet}
                      className="pr-24 font-mono text-sm bg-white border-slate-300 text-slate-900 rounded-l-lg border-r-0"
                    />
                    <Button
                      size="default"
                      variant="outline"
                      onClick={handleCopyToClipboard}
                      className={cn(
                        "absolute right-0 px-3 h-10 rounded-r-lg border-l-0",
                        "bg-amber-600 hover:bg-amber-700",
                        "text-white transition-colors",
                        copied && "bg-amber-700"
                      )}
                    >
                      {copied ? (
                        <span className="flex items-center gap-1">
                          Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="h-4 w-4" /> Copy
                        </span>
                      )}
                    </Button>
                  </div>
                  <Button 
                    className="mt-4 w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    onClick={handleUsdtSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "I'm Done"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

      </Card>
    </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;