import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from 'react'

const PAYMENT_STATES = {
  WAITING: 'waiting',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  TIMEOUT: 'timeout'
}



const TIMEOUT_SECONDS = 30;

const modalContent = {
  waiting: {
    title: 'Enter Mobile Money PIN',
    description: 'Please check your phone and enter your PIN to complete the payment',
    icon: <Loader2 className="animate-spin h-12 w-12 text-yellow-500" />,
    color: 'text-yellow-500'
  },
  processing: {
    title: 'Processing Payment',
    description: 'Please wait while we confirm your payment',
    icon: <Loader2 className="animate-spin h-12 w-12 text-blue-500" />,
    color: 'text-blue-500'
  },
  success: {
    title: 'Payment Successful!',
    description: 'Your package has been activated successfully',
    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
    color: 'text-green-500'
  },
  failed: {
    title: 'Payment Failed',
    description: 'The payment could not be processed. Please try again',
    icon: <XCircle className="h-12 w-12 text-red-500" />,
    color: 'text-red-500'
  },
  timeout: {
    title: 'Payment Timed Out',
    description: 'The payment took too long to complete. Please try again',
    icon: <Clock className="h-12 w-12 text-orange-500" />,
    color: 'text-orange-500'
  }
}

const PaymentStatusModal = ({ isOpen, status, onClose, onTimeout }) => {
  const [timeout, setTimeoutState] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);

  useEffect(() => {
    if (status === PAYMENT_STATES.WAITING) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 0) {
            clearInterval(timer);
            onTimeout?.();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, onTimeout]);

  useEffect(() => {
    if (status !== PAYMENT_STATES.WAITING) {
      setTimeLeft(TIMEOUT_SECONDS);
    }
  }, [status]);

  const content = modalContent[status] || modalContent.waiting;
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center space-y-4 p-6">
          <div className={cn("rounded-full p-3 bg-opacity-10", content.color)}>
          {content.icon}
          </div>
          <h3 className={cn("text-xl font-semibold", content.color)}>
            {content.title}
          </h3>
          <p className="text-center text-muted-foreground">
            {content.description}
          </p>
          {status === PAYMENT_STATES.WAITING && (
            <p className="text-sm text-muted-foreground">
              Time remaining: {timeLeft}s
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { PaymentStatusModal, PAYMENT_STATES }