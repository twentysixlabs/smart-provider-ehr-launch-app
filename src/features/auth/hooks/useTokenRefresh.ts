import React from "react";
import Config from "../../../environment/config.json";
import { storage } from "../../../core/storage";
import { useToken } from "./useToken";
import { useRefreshToken } from "./useAuthQueries";

interface UseTokenRefreshReturn {
  refreshToken: () => void;
  refreshError: string | null;
  isRefreshing: boolean;
  isSuccess: boolean;
}

/**
 * Custom hook to handle token refresh functionality
 * @returns Object containing refresh function, error state, and status flags
 */
export function useTokenRefresh(): UseTokenRefreshReturn {
  const { token, setToken } = useToken();
  const refreshTokenMutation = useRefreshToken();
  const [refreshError, setRefreshError] = React.useState<string | null>(null);

  const refreshToken = React.useCallback(() => {
    if (!token?.refresh_token) {
      setRefreshError("No refresh token available");
      return;
    }

    const tokenUrl = storage.getItem(Config.STORAGE_KEYS.TOKEN_URL);
    if (!tokenUrl) {
      setRefreshError("Token URL not found. Please log in again.");
      return;
    }

    setRefreshError(null);
    refreshTokenMutation.mutate(
      {
        refresh_token: token.refresh_token,
        tokenUrl,
        scope: token.scope,
      },
      {
        onSuccess: (newTokenData) => {
          setToken({
            ...token,
            ...newTokenData,
          });
        },
        onError: (error: Error) => {
          setRefreshError(error.message);
        },
      }
    );
  }, [token, setToken, refreshTokenMutation]);

  return {
    refreshToken,
    refreshError,
    isRefreshing: refreshTokenMutation.isPending,
    isSuccess: refreshTokenMutation.isSuccess,
  };
}
