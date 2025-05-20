import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePaymentStatus } from '@/hooks/payments/usePaymentStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const trans_id = searchParams.get('trans_id');
  const { status, isLoading, error } = usePaymentStatus(trans_id);

  // Handle missing transaction ID
  useEffect(() => {
    if (!trans_id) {
      toast.error('No transaction ID found');
      navigate('/activation');
    }
  }, [trans_id, navigate]);

  // Handle status changes
  useEffect(() => {
    if (status === 'SUCCESSFUL') {
      toast.success('Payment successful!, Thank you!');
      // Small delay before redirect to show success state
      const timeout = setTimeout(() => navigate('/dashboard'), 3500);
      return () => clearTimeout(timeout);
    } else if (status === 'FAILED') {
      toast.error('Payment failed. Please try again.');
    }
  }, [status, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error('Error checking payment status');
    }
  }, [error]);

  if (!trans_id) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-100/40 to-purple-100/40">
      <Card className="w-full max-w-lg p-8 text-center space-y-8 shadow-2xl rounded-3xl border-0">
        <div className="space-y-4">
          {status === 'FAILED' ? (
            <>
              <XCircle className="h-14 w-14 mx-auto text-destructive mb-2" />
              <h2 className="text-2xl font-semibold text-destructive">Payment Failed</h2>
              <p className="text-muted-foreground">Your payment could not be processed. Please try again.</p>
            </>
          ) : status === 'SUCCESSFUL' ? (
            <>
              <CheckCircle2 className="h-14 w-14 mx-auto text-green-500 mb-2 animate-bounce" />
              <h2 className="text-2xl font-semibold text-green-700">Payment Successful</h2>
              <p className="text-muted-foreground">Thank you for your payment. Redirecting to dashboard...</p>
            </>
          ) : (
            <>
              {/* Modern custom loader animation */}
              <div className="flex items-center justify-center mb-2">
                <span className="relative flex h-14 w-14">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-14 w-14 bg-gradient-to-tr from-yellow-400 via-purple-400 to-green-400 shadow-lg"></span>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Loader2 className="h-7 w-7 text-white animate-spin" />
                  </span>
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-primary">
                {isLoading ? 'Connecting...' : 'Processing Payment'}
              </h2>
              <p className="text-muted-foreground">
                {isLoading 
                  ? 'Establishing connection...'
                  : 'Please wait while we confirm your payment..You will be automatically redirected to the dashboard after the transaction is confirmed'}
              </p>
            </>
          )}
        </div>

        {!isLoading && (
          <div className="text-xs text-muted-foreground mb-2">
            Transaction ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{trans_id}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {/* <Button
            variant={status === 'FAILED' ? "default" : "outline"}
            onClick={() => navigate('/activate/payment')}
            className="w-full"
            disabled={isLoading}
          >
            {status === 'FAILED' ? 'Try Again' : 'Return to Payment Page'}
          </Button> */}
          <Button
            variant="ghost"
            onClick={() => navigate('/activation')}
            className="w-full border border-gray-200 hover:bg-gray-50"
            disabled={isLoading}
          >
            Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
