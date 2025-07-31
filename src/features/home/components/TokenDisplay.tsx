import React from "react";
import type { TokenData } from "../../auth/contexts/TokenContext";

interface TokenDisplayProps {
  token: TokenData;
}

export function TokenDisplay({ token }: TokenDisplayProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Token Data:</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {token ? JSON.stringify(token, null, 2) : "No token data available."}
      </pre>
    </div>
  );
}
