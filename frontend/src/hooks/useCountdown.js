import { useState, useEffect } from 'react';

export function useCountdown(expiresAt) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setIsExpired(true);
      return;
    }

    const expireTime = new Date(expiresAt).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = expireTime - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        return 0;
      }

      setTimeLeft(difference);
      setIsExpired(false);
      return difference;
    };

    // Initial calculation
    const initialDiff = calculateTimeLeft();
    if (initialDiff <= 0) return;

    // Set interval
    const intervalId = setInterval(() => {
      const diff = calculateTimeLeft();
      if (diff <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expiresAt]);

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return '00:00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (startedAt, expiresAtStr, currentLeft) => {
    if (!startedAt || !expiresAtStr || currentLeft <= 0) return 0;
    const start = new Date(startedAt).getTime();
    const end = new Date(expiresAtStr).getTime();
    const totalDuration = end - start;
    if (totalDuration <= 0) return 0;
    const elapsed = totalDuration - currentLeft;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  return { 
    timeLeft, 
    isExpired, 
    formattedTime: formatTime(timeLeft),
    calculateProgress
  };
}
