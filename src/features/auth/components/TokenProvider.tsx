import React, { type PropsWithChildren, useMemo } from "react";
import { TokenContext, type TokenData } from "../contexts/TokenContext";

const MILLISECONDS_PER_SECOND = 1000;

/**
 * Calculates the token expiry timestamp from the expires_in value
 * @param expiresIn Number of seconds until the token expires
 * @returns Timestamp when the token will expire
 */
function calculateTokenExpiry(expiresIn: number): number {
  return Date.now() + expiresIn * MILLISECONDS_PER_SECOND;
}

export function TokenProvider({ children }: PropsWithChildren<unknown>) {
  const [token, setTokenState] = React.useState<TokenData>(null);

  const setToken = React.useCallback((newToken: TokenData) => {
    if (newToken && newToken.expires_in) {
      setTokenState({
        ...newToken,
        token_expiry: calculateTokenExpiry(newToken.expires_in),
      });
    } else {
      setTokenState(newToken);
    }
  }, []);

  const updateToken = React.useCallback(
    (updates: Partial<NonNullable<TokenData>>) => {
      setTokenState((currentToken) => {
        if (!currentToken) return currentToken;

        const updatedToken = { ...currentToken, ...updates };

        if (updates.expires_in) {
          updatedToken.token_expiry = calculateTokenExpiry(updates.expires_in);
        }

        return updatedToken;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      token,
      setToken,
      updateToken,
    }),
    [token, setToken, updateToken]
  );

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
}
