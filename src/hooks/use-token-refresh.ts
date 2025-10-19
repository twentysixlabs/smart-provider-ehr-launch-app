import { useState, useCallback } from 'react';
import { refreshAccessToken } from '@/lib/smart-auth';
import { useTokenStore } from '@/stores/token-store';
import Config from '@/config/config.json';

export function useTokenRefresh() {
  const token = useTokenStore((state) => state.token);
  const updateToken = useTokenStore((state) => state.updateToken);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const refresh = useCallback(async () => {
    if (!token?.refresh_token) {
      setError(new Error('No refresh token available'));
      return;
    }

    setIsRefreshing(true);
    setError(null);
    setIsSuccess(false);

    try {
      const newTokenData = await refreshAccessToken(token.refresh_token, Config.CLIENT_ID);
      updateToken(newTokenData);
      setIsSuccess(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Token refresh failed');
      setError(error);
      console.error('Token refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [token, updateToken]);

  return {
    refresh,
    isRefreshing,
    error,
    isSuccess,
    canRefresh: Boolean(token?.refresh_token),
  };
}
