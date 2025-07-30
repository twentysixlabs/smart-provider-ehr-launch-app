import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppRoutes } from "../../../core/routing/AppRoutes";
import Config from "../../../config.json";
import { getCodeVerifier } from "../utils/pkce";
import { getOAuth2State } from "../utils/oauth-state";
import { useToken } from "../hooks/useToken";
import { useTokenExchange } from "../hooks/useAuthQueries";

export function SmartAuthCallback() {
  const [searchParams] = useSearchParams();
  const { setToken } = useToken();
  const navigate = useNavigate();
  const [oauthError, setOauthError] = React.useState<string | null>(null);
  const isProcessingRef = React.useRef(false);

  const tokenExchangeMutation = useTokenExchange();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error || errorDescription) {
      setOauthError(`${error}: ${errorDescription}`);
      return;
    }

    if (code && state && !isProcessingRef.current) {
      isProcessingRef.current = true;

      const localState = getOAuth2State();
      if (state !== localState) {
        setOauthError("State mismatch in OAuth callback");
        return;
      }

      const tokenUrl = localStorage.getItem(Config.STORAGE_KEYS.TOKEN_URL);
      if (!tokenUrl) {
        setOauthError(
          "Token URL not found - please restart the authentication flow"
        );
        return;
      }

      const codeVerifier = getCodeVerifier();
      if (!codeVerifier) {
        setOauthError(
          "Code verifier not found - please restart the authentication flow"
        );
        return;
      }

      tokenExchangeMutation
        .mutateAsync({
          code,
          codeVerifier,
          tokenUrl,
        })
        .then((data) => {
          setToken(data);
          // Clear auth flow values after successful exchange
          localStorage.removeItem(Config.STORAGE_KEYS.OAUTH_STATE);
          localStorage.removeItem(Config.STORAGE_KEYS.CODE_VERIFIER);
          navigate(AppRoutes.Home);
        })
        .catch((error) => {
          console.error("Token exchange failed:", error);
          setOauthError(error.message);
        });
    }
  }, [searchParams, navigate, setToken, tokenExchangeMutation]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">
        {oauthError ? "Authentication Failed" : "Authenticating..."}
      </h1>

      {oauthError ? (
        <div className="mt-4">
          <p className="text-red-500 mb-4">Error: {oauthError}</p>
          <button
            onClick={() => navigate(AppRoutes.Home)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      ) : tokenExchangeMutation.isPending ? (
        <p>Exchanging authorization code for access token...</p>
      ) : (
        <p>Processing authentication response...</p>
      )}
    </div>
  );
}
