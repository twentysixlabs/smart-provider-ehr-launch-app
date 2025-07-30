import React from "react";
import { useToken, useRefreshToken } from "../../auth";
import Config from "../../../config.json";

export function Home() {
  const { token, setToken } = useToken();
  const refreshTokenMutation = useRefreshToken();
  const [refreshError, setRefreshError] = React.useState<string | null>(null);
  const [expiryInfo, setExpiryInfo] = React.useState<{
    expired: boolean;
    message: string;
  } | null>(null);

  const handleRefreshToken = () => {
    if (!token?.refresh_token) {
      setRefreshError("No refresh token available");
      return;
    }

    const tokenUrl = localStorage.getItem(Config.STORAGE_KEYS.TOKEN_URL);
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
  };

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
        const minutes = Math.floor(timeUntilExpiry / 60000);
        const seconds = Math.floor((timeUntilExpiry % 60000) / 1000);
        setExpiryInfo({
          expired: false,
          message: `Token expires in ${minutes}m ${seconds}s`,
        });
      }
    };

    updateExpiryInfo();

    if (token?.token_expiry) {
      const interval = setInterval(updateExpiryInfo, 1000);
      return () => clearInterval(interval);
    }
  }, [token?.token_expiry]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Home</h1>
      <p className="mb-4">Welcome to the Cerner QI application!</p>

      {expiryInfo && (
        <div
          className={`mb-4 p-2 rounded ${
            expiryInfo.expired
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {expiryInfo.message}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Token Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {token ? JSON.stringify(token, null, 2) : "No token data available."}
        </pre>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleRefreshToken}
          disabled={!token?.refresh_token || refreshTokenMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {refreshTokenMutation.isPending ? "Refreshing..." : "Refresh Token"}
        </button>

        {token?.refresh_token && (
          <span className="text-sm text-gray-600">Refresh token available</span>
        )}
      </div>

      {refreshError && (
        <p className="mt-4 text-red-500">Error: {refreshError}</p>
      )}

      {refreshTokenMutation.isSuccess && (
        <p className="mt-4 text-green-600">Token refreshed successfully!</p>
      )}
    </div>
  );
}
