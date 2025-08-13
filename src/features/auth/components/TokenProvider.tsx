import React, { type PropsWithChildren, useMemo } from "react";
import { TokenContext, type TokenData } from "../contexts/TokenContext";
import { storage } from "../../../core/storage";
import Config from "../../../environment/config.json";

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
  const [token, setTokenState] = React.useState<TokenData>(() => {
    const storedToken = storage.getItem(Config.STORAGE_KEYS.TOKEN_DATA);
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
        if (parsedToken.token_expiry && parsedToken.token_expiry < Date.now()) {
          storage.removeItem(Config.STORAGE_KEYS.TOKEN_DATA);
          return null;
        }
        return parsedToken;
      } catch (error) {
        console.error("Failed to parse stored token:", error);
        storage.removeItem(Config.STORAGE_KEYS.TOKEN_DATA);
      }
    }
    return null;
  });

  const setToken = React.useCallback((newToken: TokenData) => {
    if (newToken && newToken.expires_in) {
      const tokenWithExpiry = {
        ...newToken,
        token_expiry: calculateTokenExpiry(newToken.expires_in),
      };
      setTokenState(tokenWithExpiry);
      storage.setItem(
        Config.STORAGE_KEYS.TOKEN_DATA,
        JSON.stringify(tokenWithExpiry)
      );
    } else if (newToken) {
      setTokenState(newToken);
      storage.setItem(Config.STORAGE_KEYS.TOKEN_DATA, JSON.stringify(newToken));
    } else {
      setTokenState(null);
      storage.removeItem(Config.STORAGE_KEYS.TOKEN_DATA);
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

        storage.setItem(
          Config.STORAGE_KEYS.TOKEN_DATA,
          JSON.stringify(updatedToken)
        );

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
