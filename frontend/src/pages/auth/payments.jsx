import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePackages } from '@/hooks/usePackages';
import { useAuth } from '@/hooks/useAuth';
import { useCountry } from '@/hooks/useCountry';
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
import cn from '@/lib/utils';

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
        toast.success('USDT payment submitted successfully');
        setTimeout(() => {
          navigate('/auth/activation');
        }, 1500);
      } else {
        toast.error(response.data?.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('USDT payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit payment');
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
    <div className="flex items-center bg-gradient-to-r from-yellow-500/10 to-purple-500/10 justify-center min-h-[100vh] p-4">
         <Tabs defaultValue="mobile-money" className="w-[400px]">
         <TabsList>
    <TabsTrigger value="mobile-money">Mobile Money</TabsTrigger>
    <TabsTrigger value="usdt">USDT</TabsTrigger>
  </TabsList>
  <TabsContent value="mobile-money">
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
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your mobile money number"
                
                className="w-full focus:outline-none focus:ring-indigo-500 "
                required
                disabled={isSubmitting}
              />
             
            </div>

            {/* Payment Method */}
            <div className="rounded-lg border p-4">
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
            className="w-full bg-gradient-to-r from-green-500 to-purple-500 text-white hover:bg-gradient-to-r hover:from-yellow-600 hover:to-purple-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
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
          <div className="space-y-6">
            {/* Package Summary */}
            <div className="rounded-lg bg-muted p-4">
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

            {/* USDT Payment Info */}
            <div className="bg-gradient-to-br from-purple-500/5 to-primary/5 rounded-lg p-6 space-y-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <CreditCard className="w-16 h-16 text-primary animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-4 text-center">
                <div>
                  <h3 className="font-medium text-lg mb-2">USDT Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Add the amount of <strong>  {formatAmount(selectedPackage.price)} </strong> to the address
                  </p>
                  <div className="relative flex w-full max-w-xl mx-auto mt-2">
                    <Input
                      readOnly
                      value={wallet}
                      className="pr-24 font-mono text-sm bg-background border-r-0 rounded-r-none"
                    />
                    <Button
                      size="default"
                      variant="outline"
                      onClick={handleCopyToClipboard}
                      className={cn(
                        "absolute right-0 px-3 h-10 rounded-l-none border-l-0",
                        "bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600",
                        "text-white transition-all duration-200",
                        copied && "from-green-600 to-green-600"
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
                    className="mt-4 w-full bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/90"
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
  );
}

export default PaymentPage;