import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivePrize, usePrizeClaim } from '../../hooks/usePrizeUser';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from 'react-hot-toast';

export default function PrizeClaim() {
  const { prize, isLoading, error, refetch } = useActivePrize();
  const { claimPrize, isClaiming, claimSuccess, claimError } = usePrizeClaim();
  const [countdown, setCountdown] = useState('');
  const [localClaimed, setLocalClaimed] = useState(false);
  const [localError, setLocalError] = useState(null);
  const lottieRef = useRef(null);

  // Reset local state when prize changes
  useEffect(() => {
    setLocalClaimed(false);
    setLocalError(null);
  }, [prize?.id]);

  // Handle claim button click
  const handleClaim = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Reset and play the animation
      if (lottieRef.current) {
        // Stop any ongoing animation
        lottieRef.current.stop();
        // Reset to first frame
        lottieRef.current.goToAndStop(0, true);
        // Start playing
        lottieRef.current.play();
      }
      
      // Process the claim
      await claimPrize();
      setLocalClaimed(true);
    } catch (error) {
      // Handle API errors
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to claim prize';
      setLocalError(errorMessage);
      toast.error(errorMessage);
      
      // Reset animation on error
      if (lottieRef.current) {
        lottieRef.current.stop();
        lottieRef.current.goToAndStop(0, true);
      }
    }
  }, [claimPrize]);

  // Check if the user has already claimed this prize
  const hasClaimed = localClaimed || 
    claimSuccess || 
    (claimError?.response?.data?.message?.toLowerCase().includes('already claimed'));

  // Check if the prize is fully claimed
  const isFullyClaimed = claimError?.response?.data?.message?.toLowerCase().includes('fully claimed');

  // Disable the button only if:
  // - Currently claiming
  // - User has already claimed
  // - Prize is fully claimed
  const isDisabled = isClaiming || hasClaimed || isFullyClaimed;

  // Countdown logic (if prize has start/end time)
  useEffect(() => {
    if (!prize?.endTime) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(prize.endTime).getTime();
      const diff = end - now;
      
      if (diff <= 0) {
        setCountdown('Ended');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [prize]);

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 p-4 text-center">{error.message || error.toString()}</div>;
  if (!prize) return <div className="text-center p-4">No prize available at this time. Check in between 10:00 PM TO 2:00 AM</div>;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">{prize.title}💰</CardTitle>
      </CardHeader>
      
      <div className="flex flex-col items-center space-y-4 p-4">
        {/* Countdown Timer */}
        {prize.endTime && (
          <div className="flex items-center justify-center mt-2">
            <span className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ends in: <span className="ml-1 font-mono">{countdown}</span>
            </span>
          </div>
        )}

        {/* Claim Now label */}
        {!isDisabled && !hasClaimed && !isFullyClaimed && (
          <div className="animate-bounce mb-2 text-center">
            <span className="bg-pink-600 text-white px-4 py-1 rounded-full shadow-lg text-sm font-bold">
              Claim Now!
            </span>
          </div>
        )}

        {/* Gift Box Animation */}
        <div className="my-4 flex justify-center">
          <div
            className={`transition-all duration-200 ${
              !isDisabled && !hasClaimed ? 'hover:scale-110 ring-4 ring-yellow-400/60 ring-offset-2' : ''
            }`}
            style={{
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              borderRadius: '24px',
              background: 'linear-gradient(135deg,#fff7e6 70%,#ffd700 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              transition: 'all 0.2s ease-in-out',
            }}
            onClick={!isDisabled ? handleClaim : undefined}
          >
            <div style={{ width: 220, height: 220, position: 'relative', pointerEvents: 'none' }}>
              <DotLottieReact
                ref={lottieRef}
                src="https://lottie.host/cd519ead-5108-4f16-878a-fd8596440eb2/lCwZMOpPVZ.lottie"
                loop={false}
                autoplay={false}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none',
                  zIndex: 10
                }}
                onComplete={() => {
                  // Reset to first frame when animation completes
                  if (lottieRef.current) {
                    lottieRef.current.goToAndStop(0, true);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Status message */}
        <div className="text-center text-lg font-semibold mt-4 min-h-8">
          {isClaiming ? (
            <span>Claiming...</span>
          ) : hasClaimed ? (
            <span className="text-green-600">🎉 Prize Claimed!</span>
          ) : isFullyClaimed ? (
            <span className="text-amber-600">Prize has been fully claimed</span>
          ) : (
            <span>Tap the box to claim!</span>
          )}
        </div>

        {/* Error message */}
        {localError && (
          <div className="text-red-500 text-sm mt-2">
            {localError}
          </div>
        )}
      </div>
    </div>
  );
}
