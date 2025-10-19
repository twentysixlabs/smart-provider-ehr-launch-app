import { useState, useEffect } from 'react';
import type { TokenData, TokenExpiryInfo } from '@/types';

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return 'Expired';

  const totalSeconds = Math.floor(milliseconds / MILLISECONDS_PER_SECOND);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function useTokenExpiry(token: TokenData | null): TokenExpiryInfo {
  const [timeRemaining, setTimeRemaining] = useState<string>('N/A');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!token || !token.token_expiry) {
      setTimeRemaining('N/A');
      setIsExpired(false);
      return;
    }

    const updateTimeRemaining = () => {
      const now = Date.now();
      const remaining = token.token_expiry! - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
      } else {
        setIsExpired(false);
        setTimeRemaining(formatTimeRemaining(remaining));
      }
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [token]);

  return {
    isExpired,
    timeRemaining,
    expiresAt: token?.token_expiry ? new Date(token.token_expiry) : null,
    canRefresh: Boolean(token?.refresh_token),
  };
}
