import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import p5 from 'p5';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';


export default function PaymentStatusPage() {

  const canvasRef = useRef();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState('pending');
  
  // Get transaction details from URL
  const params = new URLSearchParams(location.search);
  const trans_id = params.get('trans_id');
  const packageName = params.get('package');
  const amount = params.get('amount');

  console.log('Payment Status Page Params:', { trans_id, packageName, amount });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  useEffect(() => {
 
    let sketch = (p) => {
      let particles = [];
      const numParticles = 50;

      class Particle {
        constructor() {
          this.pos = p.createVector(p.random(p.width), p.random(p.height));
          this.vel = p.createVector(p.random(-2, 2), p.random(-2, 2));
          this.size = p.random(5, 15);
          this.color = p.color(100, 149, 237); // Cornflower blue
        }

        update() {
          this.pos.add(this.vel);
          if (this.pos.x < 0 || this.pos.x > p.width) this.vel.x *= -1;
          if (this.pos.y < 0 || this.pos.y > p.height) this.vel.y *= -1;
        }

        display() {
          p.noStroke();
          p.fill(this.color);
          p.circle(this.pos.x, this.pos.y, this.size);
        }
      }

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current);
        for (let i = 0; i < numParticles; i++) {
          particles.push(new Particle());
        }
      };

      p.draw = () => {
        p.background(20, 20, 30);
        
        p.stroke(100, 149, 237, 50);
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            let d = p.dist(
              particles[i].pos.x, particles[i].pos.y,
              particles[j].pos.x, particles[j].pos.y
            );
            if (d < 100) {
              p.line(
                particles[i].pos.x, particles[i].pos.y,
                particles[j].pos.x, particles[j].pos.y
              );
            }
          }
        }

        particles.forEach(particle => {
          particle.update();
          particle.display();
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    let p5Instance = new p5(sketch);

    // Start polling every minute for 7 minutes
    const pollInterval = 30000; // 1 minute
    const maxAttempts = 7; // 7 minutes total
    
    const checkPaymentStatus = async () => {
      try {
        console.log(`📡 Checking payment status (attempt ${attempts + 1}/${maxAttempts})`);
        
        const response = await api.post('/payments/status/check', { trans_id: trans_id });
        console.log('📥 Full response:', response.data);
        console.log('📥 Payment status:', response.data.data?.status);
        
        if (!response.data.success) {
          console.warn('Status check not successful:', response.data);
          return false;
        }
        
        const newStatus = response.data.data?.status?.toLowerCase() || 'PENDING';
        setStatus(newStatus);

        // Handle definitive statuses
        if (newStatus === 'SUCCESSFUL') {
          console.log('✅ Payment successful');
          queryClient.invalidateQueries(['userPackage']);
          toast.success('Payment successful');
          setTimeout(() => navigate('/dashboard'), 3000);
          return true;
        } else if (newStatus === 'failed') {
          console.log('❌ Payment failed');
          toast.error('Payment failed, please try again');
          setTimeout(() => navigate('/activation'), 3000);
          return true;
        }
        
        return false;
      } catch (error) {
        toast.error('An error occurred while checking payment status');
        console.error('💥 Error checking payment status:', error);
        return false;
      }
    };

    // Initial check
    checkPaymentStatus();

    // Setup interval for subsequent checks
    const intervalId = setInterval(async () => {
      setAttempts(prev => {
        // Stop if we've reached max attempts
        if (prev >= maxAttempts - 1) {
          clearInterval(intervalId);
          return prev;
        }
        return prev + 1;
      });
      
      const isDone = await checkPaymentStatus();
      if (isDone) {
        clearInterval(intervalId);
      }
    }, pollInterval);

    return () => {
      clearInterval(intervalId);
      p5Instance.remove();
    };
  }, [trans_id, navigate, queryClient, packageName, amount]);

  const getStatusMessage = () => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'Payment successful! Redirecting...';
      case 'FAILED':
        return 'Payment failed. Redirecting...';
      case 'PENDING':
        return 'Please wait while we confirm your payment...';
      default:
        return 'Checking payment status...';
    }
  };

  return (
    <div className="fixed inset-0 bg-background">
      <div ref={canvasRef} className="absolute inset-0 -z-10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/80 backdrop-blur-sm p-8 rounded-lg shadow-lg text-center space-y-6 max-w-md w-full mx-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-primary">Processing Payment</h1>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-muted-foreground">{getStatusMessage()}</p>
            </div>
          </div>

          {(packageName || amount) && (
            <div className="space-y-1 text-sm">
              {packageName && (
                <p className="text-muted-foreground">Package: <span className="text-primary font-medium">{packageName}</span></p>
              )}
              {amount && (
                <p className="text-muted-foreground">Amount: <span className="text-primary font-medium">{formatCurrency(amount)}</span></p>
              )}
              <p className="text-muted-foreground">Transaction ID: <span className="text-xs text-primary/70 font-mono">{trans_id}</span></p>
            </div>
          )}

          {attempts >= 6 && status === 'pending' && (
            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-sm text-yellow-600">Payment is taking longer than usual.</p>
              <Button 
                variant="outline"
                onClick={() => navigate('/activation')}
              >
                Return to Payments Page and Refresh after 2 minutes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}