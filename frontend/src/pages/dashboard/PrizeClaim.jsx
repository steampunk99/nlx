import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useActivePrize, usePrizeClaim } from '../../hooks/usePrizeUser';
import { useMemo } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import {DotLottieReact} from '@lottiefiles/dotlottie-react'; // If not installed, use a similar Lottie player

// Helper to memoize atom per prizeId
function getPrizeClaimedAtom(prizeId) {
  return atomWithStorage(`prizeClaimed-${prizeId}`, false);
}

export default function PrizeClaim() {
  const { prize, isLoading, error } = useActivePrize();
  const { claimPrize, isClaiming, claimSuccess, disableButton, claimError } = usePrizeClaim();
  const [countdown, setCountdown] = useState('');
  const lottieRef = useRef(null);

  // Atom for per-prize claim state (do not recreate atom on every render)
  const prizeId = prize?.id ? String(prize.id) : null;
  const prizeClaimedAtom = useMemo(() => getPrizeClaimedAtom(prizeId || 'null'), [prizeId]);
  const [prizeClaimed, setPrizeClaimed] = useAtom(prizeClaimedAtom);

  // When claimSuccess or backend error 'already claimed', persist claim state
  useEffect(() => {
    if (claimSuccess) setPrizeClaimed(true);
    // Also handle backend error 'already claimed'
    if (claimError?.response?.data?.message?.toLowerCase().includes('already claimed')) {
      setPrizeClaimed(true);
    }
  }, [claimSuccess, claimError, setPrizeClaimed]);



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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error.message || error.toString()}</div>;
  if (!prize) return <div>No prize available at this time. Check in between 10:00 PM TO 2:00 AM</div>;

  // Disable interaction if claimed, claiming, or already clicked
  const interactionDisabled = disableButton || prizeClaimed;

  return (
    <div className="max-w-lg mx-auto mt-10">
     
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">{prize.title}💰</CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center space-y-4">
         
         
          {/* Countdown Timer as a badge */}
          {prize.endTime && (
            <div className="flex items-center justify-center mt-2">
              <span className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Ends in: <span className="ml-1 font-mono">{countdown}</span>
              </span>
            </div>
          )}

          {/* Floating Claim Now label */}
          {!interactionDisabled && !claimSuccess && (
            <div className="animate-bounce mb-2 text-center">
              <span className="bg-pink-600 text-white px-4 py-1 rounded-full shadow-lg text-sm font-bold">Claim Now!</span>
            </div>
          )}

          {/* Gift Box Animation with controlled playback */}
          <div className="my-4 flex justify-center">
            <div
              className={`transition-transform duration-200 ${!interactionDisabled && !claimSuccess ? 'hover:scale-110 ring-4 ring-yellow-400/60 ring-offset-2' : ''}`}
              style={{ cursor: interactionDisabled ? 'not-allowed' : 'pointer', opacity: interactionDisabled ? 0.5 : 1, borderRadius: 24, background: 'linear-gradient(135deg,#fff7e6 70%,#ffd700 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
              onClick={async () => {
                if (interactionDisabled) return;
                // Play the Lottie animation on click only
                lottieRef.current?.play();
                await claimPrize();
              }}
            >
              {/* Lottie animation controlled by ref */}
              <DotLottieReact
                ref={lottieRef}
                src="https://lottie.host/cd519ead-5108-4f16-878a-fd8596440eb2/lCwZMOpPVZ.lottie"
                loop={false}
                autoplay={false}
                style={{ width: 220, height: 220 }}
              />
            </div>
          </div>

          {/* Confetti burst on claim success */}
          {claimSuccess && (
            <>
              {/* TODO: Install and import a confetti library, e.g. react-confetti or canvas-confetti, and trigger burst here */}
              {/* <Confetti active={true} /> */}
            </>
          )}

          {/* Status message */}
          <div className="text-center text-lg font-semibold mt-4">
            {claimSuccess ? <span className="text-green-600">🎉 Prize Claimed!</span> : isClaiming ? 'Claiming...' : interactionDisabled ? 'Closed' : 'Tap the box to claim!'}
          </div>
        </div>
      
    </div>
  );
}
