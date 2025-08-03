/* cspell:ignore Fhir FHIR */
import { useQuery } from "@tanstack/react-query";
import type { TokenData } from "../../auth/contexts/TokenContext";
import { useToken } from "../../auth";
import { useRefreshToken } from "../../auth";
import { FhirError } from "./useFhirData";
import { tokenRefreshManager } from "./useTokenRefreshManager";

interface UseFhirQueryOptions<T> {
  queryKey: (string | undefined | null)[];
  queryFn: () => Promise<T>;
  enabled: boolean;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Checks if the token is expired or about to expire
 * @param tokenData The token data
 * @param bufferMs Buffer time in milliseconds before expiry (default 30 seconds)
 * @returns true if token is expired or about to expire
 */
function isTokenExpired(tokenData: TokenData | null, bufferMs = 30000): boolean {
  if (!tokenData?.token_expiry) return true;
  return Date.now() >= tokenData.token_expiry - bufferMs;
}

/**
 * A wrapper hook that adds automatic token refresh capability to FHIR queries
 */
export function useFhirQueryWithRefresh<T>(options: UseFhirQueryOptions<T>) {
  const { token, setToken } = useToken();
  const refreshTokenMutation = useRefreshToken();

  return useQuery<T, Error>({
    ...options,
    queryFn: async () => {
      if (isTokenExpired(token)) {
        try {
          const newTokenData = await tokenRefreshManager.refreshToken(
            token!,
            refreshTokenMutation.mutateAsync
          );

          const updatedToken = {
            ...token!,
            ...newTokenData,
            token_expiry: Date.now() + (newTokenData.expires_in || 3600) * 1000,
          };
          setToken(updatedToken);
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return options.queryFn();
    },
    retry: (failureCount, error) => {
      if (error instanceof FhirError && error.statusCode === 401 && failureCount === 0) {
        return true;
      }

      if (error instanceof FhirError && error.statusCode === 403) {
        return false;
      }

      return failureCount < 3;
    },
  });
}