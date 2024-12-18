// components/packages/PaymentDialog.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentMethodButton } from "./payment-method-btn"
import { PaymentSummary } from "./payment-summary"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"


export function PaymentDialog({ 
    isOpen,
    onClose,
    selectedPackage,
    paymentMethod,
    setPaymentMethod,
    phoneNumber,
    setPhoneNumber,
    onConfirmPurchase,
    isSubmitting,
    paymentMethodError,
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase Package</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6">
              <PaymentMethodButton
                method={paymentMethod}
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />
    
        {paymentMethod === 'mobile money' && (
  <div className="space-y-3">
    <Label htmlFor="phoneNumber">Mobile Money Number</Label>
    <Input
      id="phoneNumber"
      type="tel"
      placeholder="Enter your mobile money number"
      value={phoneNumber}
      onChange={(e) => {
        setPhoneNumber(e.target.value);
        setPaymentMethodError('');
      }}
      className={cn(
        "h-12",
        paymentMethodError && "border-red-500"
      )}
    />
    {paymentMethodError && (
      <p className="text-sm text-red-500">
        {paymentMethodError}
      </p>
    )}
  </div>
)}
    
              <PaymentSummary package={selectedPackage} />
    
              <Button 
                onClick={onConfirmPurchase}
                disabled={isSubmitting || !paymentMethod || (paymentMethod === 'MOBILE_MONEY' && !phoneNumber)}
                className={cn(
                  "w-full h-12 text-base font-medium bg-gradient-to-r from-primary via-purple-500 to-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? <LoadingSpinner /> : "Complete Payment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )
    }