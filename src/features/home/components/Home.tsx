import React from "react";
import { useToken } from "../../auth";
import { useTokenExpiryDisplay } from "../hooks/useTokenExpiryDisplay";
import { useTokenRefresh } from "../hooks/useTokenRefresh";
import { TokenDisplay } from "./TokenDisplay";

export function Home() {
  const { token } = useToken();
  const expiryInfo = useTokenExpiryDisplay(token);
  const {
    refreshToken,
    refreshError,
    isRefreshing,
    isSuccess,
  } = useTokenRefresh();

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

      <TokenDisplay token={token} />

      <div className="flex items-center gap-4">
        <button
          onClick={refreshToken}
          disabled={!token?.refresh_token || isRefreshing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Token"}
        </button>

        {token?.refresh_token && (
          <span className="text-sm text-gray-600">Refresh token available</span>
        )}
      </div>

      {refreshError && (
        <p className="mt-4 text-red-500">Error: {refreshError}</p>
      )}

      {isSuccess && (
        <p className="mt-4 text-green-600">Token refreshed successfully!</p>
      )}
    </div>
  );
}
