import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
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
    <div className='min-h-screen w-full bg-gradient-to-r from-yellow-500/10 to-purple-500/10'>
    <div className="container max-w-lg mx-auto my-auto  py-8 min-h-screen">
      <Card className="p-8 text-center space-y-6">
        <div className="space-y-2">
          {status === 'FAILED' ? (
            <>
              <XCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-2xl font-semibold text-destructive">Payment Failed</h2>
              <p className="text-muted-foreground">
                Your payment could not be processed. Please try again.
              </p>
            </>
          ) : status === 'SUCCESSFUL' ? (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold text-primary">Payment Successful</h2>
              <p className="text-muted-foreground">
                Thank you for your payment. Redirecting to dashboard...
              </p>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <h2 className="text-2xl font-semibold">
                {isLoading ? 'Connecting...' : 'Processing Payment'}
              </h2>
              <p className="text-muted-foreground">
                {isLoading 
                  ? 'Establishing connection...'
                  : 'Please wait while we confirm your payment...'}
              </p>
            </>
          )}
        </div>

        {!isLoading && (
          <div className="text-sm text-muted-foreground">
            Transaction ID: {trans_id}
          </div>
        )}

        <Button
          variant={status === 'FAILED' ? "default" : "outline"}
          onClick={() => navigate('/activate/payment')}
          className="w-full"
          disabled={isLoading}
        >
          {status === 'FAILED' ? 'Try Again' : 'Return to Payment Page'}
        </Button>
      </Card>
    </div>
    </div>
  );
}
