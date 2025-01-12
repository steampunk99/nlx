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
import { Phone, Package, CreditCard, ArrowBigLeft, ClipboardCopy, ClipboardPaste, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {motion} from "framer-motion";
import ReactCountryFlag from 'react-country-flag';
import {cn} from '@/lib/utils';
import useSiteConfigStore from '@/store/siteConfigStore';

function ManualPayment() {
  const location = useLocation();
  const { user } = useAuth();
  const selectedPackage = location.state?.selectedPackage;
  const navigate = useNavigate();
  const { country, currency, formatAmount } = useCountry();
  const { config } = useSiteConfigStore();

  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false)
  const [transactionId, setTransactionId] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const mobileMoneyAccounts = {
    mtn: {
      number: config.mtnCollectionNumber,
      name: "Earn Drip"
    },
    airtel: {
      number: config.airtelCollectionNumber,
      name: "Earn Drip"
    }
  };

//handle copy to clipboard
const handleCopyToClipboard = () => {
  navigator.clipboard.writeText(wallet);
  setCopied(true);
  toast.success('Wallet address copied!');
  setTimeout(() => setCopied(false), 2000);
}

const handleCopy = (text) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard!");
};

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText();
    setTransactionId(text);
    toast.success("Transaction ID pasted!");
  } catch (error) {
    toast.error("Failed to paste from clipboard");
  }
};

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
          navigate(`/payment-status?transactionId=${response.data.trans_id}`);
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

  const handleSubmitManual = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }

    try {
      setIsSubmittingManual(true);
      const response = await api.post("/payments/manual-payment", {
        amount: selectedPackage.price,
        packageId: selectedPackage.id,
        transactionId: transactionId.trim()
      });

      if (response.data?.success) {
        toast.success("Payment submitted successfully");
        setTimeout(() => {
          navigate(`/manual-payment-status?transactionId=${response.data.transactionId}`);
        }, 1500);
      } else {
        toast.error(response.data?.message || "Failed to submit payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to submit payment");
    } finally {
      setIsSubmittingManual(false);
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
          navigate(`/usdt-payment-status?transactionId=${response.data.trans_id}&amount=${selectedPackage.price}`);
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

  const wallet = config.usdtWalletAddress;

  return (
    <div className="flex items-center bg-gradient-to-r from-yellow-500/10 to-purple-500/10 justify-center min-h-[100vh] p-4">
         <Tabs defaultValue="mobile-money" className="w-[400px]">
         <TabsList>
    <TabsTrigger value="mobile-money">MobileMoney</TabsTrigger>
    <TabsTrigger value="usdt">USDT</TabsTrigger>
  </TabsList>
  <TabsContent value="mobile-money">
  <Card>
        <CardHeader>
          <CardTitle>Package Payment</CardTitle>
          <CardDescription>
            Send {formatAmount(selectedPackage?.price)} to any of the numbers below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
              {/* Payment Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MTN Account */}
                <div className="flex items-center p-3 border rounded-lg bg-yellow-500 text-white">
                  <div className="flex items-center flex-1 gap-3">
                  
                    <div>
                      <p className="text-sm font-medium">{mobileMoneyAccounts.mtn.name}</p>
                      <p className="text-sm text-primary font-mono font-bold">{mobileMoneyAccounts.mtn.number}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(mobileMoneyAccounts.mtn.number)}>
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Airtel Account */}
                <div className="flex items-center p-3 border rounded-lg bg-red-800 text-white">
                  <div className="flex items-center flex-1 gap-3">
                  
                    <div>
                      <p className="text-sm font-medium">{mobileMoneyAccounts.airtel.name}</p>
                      <p className="text-sm text-primary font-mono font-bold">{mobileMoneyAccounts.airtel.number}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(mobileMoneyAccounts.airtel.number)}>
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Choose either MTN or Airtel Money number above</li>
                  <li>Send exactly {currency.symbol} {formatAmount(selectedPackage?.price)} to the selected number</li>
                  <li>Copy the transaction ID from your mobile money message</li>
                  <li>Paste the transaction ID below and submit</li>
                </ol>
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={handlePaste}
                  >
                    <ClipboardPaste className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 text-white"
                  onClick={handleSubmitManual}
                  disabled={isSubmittingManual || !transactionId.trim()}
                >   
                  {isSubmittingManual ? "Submitting..." : "Submit Payment"}
                </Button>
              </div>
            </CardContent>
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
                 USDT
                  <span className="font-medium text-primary">
                    {formatAmount(selectedPackage.price/3900)}
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
                    Add the amount of <strong>  {formatAmount(selectedPackage.price/3900)} </strong> to the address
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
                          <ClipboardCopy className="h-4 w-4" /> Copy
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

export default ManualPayment;