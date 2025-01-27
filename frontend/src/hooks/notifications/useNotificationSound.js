import { useEffect, useRef } from 'react';

export function useNotificationSound() {
  const audioRef = useRef(new Audio('/sounds/notification.mp3'));

  const playSound = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0; // Reset to start
    audioRef.current.play().catch((error) => {
      console.warn('Failed to play notification sound:', error);
    });
  };

  return playSound;
}
