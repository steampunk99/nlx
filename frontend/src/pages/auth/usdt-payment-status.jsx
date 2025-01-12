import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const POLL_INTERVAL = 15000; // Poll every 15 seconds

export default function UsdtPaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const trans_id = searchParams.get('trans_id');
  const amount1 = searchParams.get('amount');

  const { usdtWalletAddress } = useSiteConfig();
  const USDT_WALLET = usdtWalletAddress;
  const amount = parseFloat(amount1) / 3900;

  const [status, setStatus] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // Copy wallet address to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(USDT_WALLET);
    setCopied(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    try {
      const response = await api.get(`/payments/status?trans_id=${trans_id}`);
      if (response.data?.status) {
        setStatus(response.data.status);
        if (response.data.status !== 'PENDING') {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft > 0 && status === 'PENDING') {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setStatus('EXPIRED');
      setIsLoading(false);
    }
  }, [timeLeft, status]);

  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Poll for payment status
  useEffect(() => {
    if (!trans_id || status !== 'PENDING') return;

    const pollInterval = setInterval(checkPaymentStatus, POLL_INTERVAL);
    checkPaymentStatus(); // Initial check

    return () => clearInterval(pollInterval);
  }, [trans_id, status]);

  // Handle missing transaction data
  useEffect(() => {
    if (!trans_id || !amount) {
      toast.error('Invalid payment details');
      navigate('/activation');
    }
  }, [trans_id, amount, navigate]);

  // Handle status changes
  useEffect(() => {
    if (status === 'SUCCESSFUL') {
      toast.success('Payment confirmed! Thank you!');
      const timeout = setTimeout(() => navigate('/dashboard'), 3500);
      return () => clearTimeout(timeout);
    } else if (status === 'FAILED') {
      toast.error('Payment verification failed. Please try again.');
    } else if (status === 'EXPIRED') {
      toast.error('Payment time expired. Please try again.');
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-500/10 to-purple-500/10">
      <Card className="w-full max-w-lg p-8 text-center space-y-6">
        <div className="space-y-4">
          {status === 'FAILED' || status === 'EXPIRED' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <XCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-2xl font-semibold text-destructive mt-4">
                {status === 'FAILED' ? 'Payment Failed' : 'Payment Expired'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {status === 'FAILED' 
                  ? 'Your payment could not be verified. Please try again.'
                  : 'The payment time has expired. Please start a new payment.'}
              </p>
            </motion.div>
          ) : status === 'SUCCESSFUL' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold text-primary mt-4">
                Payment Successful
              </h2>
              <p className="text-muted-foreground mt-2">
                Thank you for your payment. Redirecting to dashboard...
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <div>
                <h2 className="text-2xl font-semibold">Waiting for Payment</h2>
                <p className="text-muted-foreground mt-2">
                  Please send exactly {amount.toFixed(2)} USDT to the following address:
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <code className="text-primary flex-1 text-left">{USDT_WALLET}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyToClipboard}
                    className={cn("transition-all", copied && "text-green-500")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Time remaining: <span className="font-mono">{formatTimeRemaining()}</span>
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / 900) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Send only USDT (TRC20 network)</p>
                <p>• Include the transaction ID in the memo: {trans_id}</p>
                <p>• Payment will expire in {formatTimeRemaining()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <div>Transaction ID: {trans_id}</div>
          <div>Amount: {amount.toFixed(2)} USDT</div>
        </div>

        <div className="space-y-3">
          <Button
            variant={status === 'PENDING' ? "outline" : "default"}
            onClick={() => status === 'PENDING' ? window.location.reload() : navigate('/activation')}
            className="w-full"
            disabled={isLoading}
          >
            {status === 'PENDING' ? 'Check Payment Status' : 'Start New Payment'}
          </Button>

          {status === 'PENDING' && (
            <Button
              variant="link"
              className="w-full text-muted-foreground"
              onClick={() => navigate('/support')}
            >
              Need help? Contact support <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
