import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppRoutes } from "../../../core/routing/AppRoutes";
import Config from "../../../config.json";
import { getOrCreateCodeVerifier } from "../utils/pkce";
import { getOrCreateOAuthState } from "../utils/oauth-state";
import { useToken } from "../hooks/useToken";
import { useTokenExchange } from "../hooks/useAuthQueries";

interface OAuthCallbackParams {
  code: string | null;
  state: string | null;
  error: string | null;
  errorDescription: string | null;
}

function validateOAuthResponse(params: OAuthCallbackParams): string | null {
  const { error, errorDescription } = params;
  if (error || errorDescription) {
    return `${error}: ${errorDescription}`;
  }
  return null;
}

function validateAuthFlowData(
  state: string
): {
  isValid: boolean;
  error?: string;
  tokenUrl?: string;
  codeVerifier?: string;
} {
  const localState = getOrCreateOAuthState();
  if (state !== localState) {
    return { isValid: false, error: "State mismatch in OAuth callback" };
  }

  const tokenUrl = localStorage.getItem(Config.STORAGE_KEYS.TOKEN_URL);
  if (!tokenUrl) {
    return {
      isValid: false,
      error: "Token URL not found - please restart the authentication flow",
    };
  }

  const codeVerifier = getOrCreateCodeVerifier();
  if (!codeVerifier) {
    return {
      isValid: false,
      error: "Code verifier not found - please restart the authentication flow",
    };
  }

  return { isValid: true, tokenUrl, codeVerifier };
}

export function SmartAuthCallback() {
  const [searchParams] = useSearchParams();
  const { setToken } = useToken();
  const navigate = useNavigate();
  const [oauthError, setOauthError] = React.useState<string | null>(null);
  const hasInitiatedTokenExchange = React.useRef(false);

  const tokenExchangeMutation = useTokenExchange();

  useEffect(() => {
    const params: OAuthCallbackParams = {
      code: searchParams.get("code"),
      state: searchParams.get("state"),
      error: searchParams.get("error"),
      errorDescription: searchParams.get("error_description"),
    };

    const responseError = validateOAuthResponse(params);
    if (responseError) {
      setOauthError(responseError);
      return;
    }

    if (params.code && params.state && !hasInitiatedTokenExchange.current) {
      hasInitiatedTokenExchange.current = true;

      const validation = validateAuthFlowData(params.state);
      if (!validation.isValid) {
        setOauthError(validation.error!);
        return;
      }

      tokenExchangeMutation
        .mutateAsync({
          code: params.code,
          codeVerifier: validation.codeVerifier!,
          tokenUrl: validation.tokenUrl!,
        })
        .then((data) => {
          setToken(data);
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
