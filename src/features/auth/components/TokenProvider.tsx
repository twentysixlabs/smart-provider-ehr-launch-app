import React, { type PropsWithChildren, useMemo } from "react";
import { TokenContext, type TokenData } from "../contexts/TokenContext";

export function TokenProvider({ children }: PropsWithChildren<unknown>) {
  const [token, setTokenState] = React.useState<TokenData>(null);

  const setToken = React.useCallback((newToken: TokenData) => {
    if (newToken && newToken.expires_in) {
      const expiryTime = Date.now() + newToken.expires_in * 1000;
      setTokenState({
        ...newToken,
        token_expiry: expiryTime,
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
          updatedToken.token_expiry = Date.now() + updates.expires_in * 1000;
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
