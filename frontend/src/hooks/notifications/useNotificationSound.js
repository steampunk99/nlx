import { useEffect, useRef } from 'react';

export function useNotificationSound() {
  const audioRef = useRef(new Audio('/notification.mp3'));

  const playSound = () => {
    audioRef.current.play().catch(() => {
      // Ignore errors - browsers may block autoplay
    });
  };

  return playSound;
}
