import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const POLL_INTERVAL = 15000; // Poll every 15 seconds

export default function ManualPaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transactionId = searchParams.get('transactionId');

  const [status, setStatus] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Check payment status
  const checkPaymentStatus = async () => {
    try {
      const response = await api.get(`/payments/status?transactionId=${transactionId}`);
      console.log('Payment status response:', response.data);
      
      if (response.data?.success) {
        const newStatus = response.data.status;
        setStatus(newStatus);
        setPaymentDetails(response.data);

        // Handle status changes
        if (newStatus !== 'PENDING') {
          setIsLoading(false);
          clearInterval(window.pollInterval);

          if (newStatus === 'COMPLETED' || newStatus === 'SUCCESSFUL') {
            toast.success('Payment confirmed! Redirecting to dashboard...');
            setTimeout(() => navigate('/dashboard'), 2000);
          } else if (newStatus === 'FAILED') {
            toast.error('Payment verification failed. Please try again.');
            setTimeout(() => navigate('/activation'), 2000);
          }
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setError(error.response?.data?.message || error.message);
      setIsLoading(false);
      clearInterval(window.pollInterval);
      toast.error('Failed to verify payment. Please try again.');
      setTimeout(() => navigate('/activation'), 3000);
    }
  };

  // Poll for status updates
  useEffect(() => {
    if (!transactionId) {
      setError('No transaction ID provided');
      setIsLoading(false);
      return;
    }

    // Initial check
    checkPaymentStatus();

    // Set up polling
    window.pollInterval = setInterval(checkPaymentStatus, POLL_INTERVAL);

    // Cleanup
    return () => {
      if (window.pollInterval) {
        clearInterval(window.pollInterval);
      }
    };
  }, [transactionId]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />,
          title: 'Verifying Payment',
          description: 'Please wait while we verify your payment...',
          color: 'text-yellow-500'
        };
      case 'COMPLETED':
      case 'SUCCESSFUL':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
          title: 'Payment Successful',
          description: 'Your payment has been confirmed! Redirecting...',
          color: 'text-green-500'
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Payment Failed',
          description: 'Your payment verification failed. Redirecting...',
          color: 'text-red-500'
        };
      default:
        return {
          icon: <XCircle className="w-16 h-16 text-gray-500" />,
          title: 'Unknown Status',
          description: 'Could not determine payment status.',
          color: 'text-gray-500'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500 text-center">Error</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Button onClick={() => navigate('/activation')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={cn("text-center text-xl", statusDisplay.color)}>
            {statusDisplay.title}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {statusDisplay.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="my-4"
          >
            {statusDisplay.icon}
          </motion.div>

          {paymentDetails && (
            <div className="w-full space-y-3 text-base border rounded-lg p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Package:</span>
                <span className="font-medium">{paymentDetails.packageName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">UGX {paymentDetails.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm">{paymentDetails.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method:</span>
                <span>{paymentDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date:</span>
                <span>{format(new Date(paymentDetails.createdAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <span className={cn("font-medium", statusDisplay.color)}>{status}</span>
              </div>
            </div>
          )}

          {(status === 'FAILED' || error) && (
            <Button onClick={() => navigate('/activation')} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
