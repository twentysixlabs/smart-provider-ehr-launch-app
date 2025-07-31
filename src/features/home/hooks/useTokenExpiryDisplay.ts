import React from "react";
import type { TokenData } from "../../auth/contexts/TokenContext";

const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_MINUTE = 60000;

interface ExpiryInfo {
  expired: boolean;
  message: string;
}

/**
 * Custom hook to display token expiry information with live countdown
 * @param token The token data containing expiry timestamp
 * @returns Expiry information with expired status and human-readable message
 */
export function useTokenExpiryDisplay(token: TokenData): ExpiryInfo | null {
  const [expiryInfo, setExpiryInfo] = React.useState<ExpiryInfo | null>(null);

  React.useEffect(() => {
    const updateExpiryInfo = () => {
      if (!token?.token_expiry) {
        setExpiryInfo(null);
        return;
      }

      const now = Date.now();
      const timeUntilExpiry = token.token_expiry - now;

      if (timeUntilExpiry <= 0) {
        setExpiryInfo({ expired: true, message: "Token has expired" });
      } else {
        const minutes = Math.floor(timeUntilExpiry / MILLISECONDS_PER_MINUTE);
        const seconds = Math.floor(
          (timeUntilExpiry % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND
        );
        setExpiryInfo({
          expired: false,
          message: `Token expires in ${minutes}m ${seconds}s`,
        });
      }
    };

    updateExpiryInfo();

    if (token?.token_expiry) {
      const interval = setInterval(updateExpiryInfo, MILLISECONDS_PER_SECOND);
      return () => clearInterval(interval);
    }
  }, [token?.token_expiry]);

  return expiryInfo;
}
