import { useQuery, useMutation } from "@tanstack/react-query";
import { AppRoutes } from "../../../core/routing/AppRoutes";
import { concatPath } from "../../../core/utils/urlUtils";
import Config from "../../../config.json";

type WellKnownMetadata = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint: string;
  token_endpoint_auth_methods_supported: string[];
  token_endpoint_auth_signing_alg_values_supported: string[];
  jwks_uri: string;
  grant_types_supported: string[];
  scopes_supported: string[];
  response_types_supported: string[];
  management_endpoint: string;
  introspection_endpoint: string;
  capabilities: string[];
  code_challenge_methods_supported: string[];
};

type TokenExchangeParams = {
  code: string;
  codeVerifier: string;
  tokenUrl: string;
};

type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
  patient?: string;
  encounter?: string;
  need_patient_banner?: boolean;
  smart_style_url?: string;
};

type RefreshTokenParams = {
  refresh_token: string;
  tokenUrl: string;
  scope?: string;
};

// API functions
async function fetchWellKnownMetadata(iss: string): Promise<WellKnownMetadata> {
  const url = `${iss}/.well-known/smart-configuration`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch well-known metadata: ${response.statusText}`
    );
  }
  return response.json();
}

async function exchangeCodeForToken({
  code,
  codeVerifier,
  tokenUrl,
}: TokenExchangeParams): Promise<TokenResponse> {
  const params = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: concatPath(Config.BASE_URL, AppRoutes.CernerCallback),
    code_verifier: codeVerifier,
    client_id: Config.CERNER_CLIENT_ID,
  };

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Token exchange failed: ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        errorMessage = `OAuth Error: ${errorData.error}`;
        if (errorData.error_description) {
          errorMessage += ` - ${errorData.error_description}`;
        }
      }
    } catch {
      errorMessage += ` - ${errorText}`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export function useWellKnownMetadata(iss: string | null) {
  return useQuery({
    queryKey: ["wellKnownMetadata", iss],
    queryFn: () => fetchWellKnownMetadata(iss!),
    enabled: !!iss,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

async function refreshAccessToken({
  refresh_token,
  tokenUrl,
  scope,
}: RefreshTokenParams): Promise<TokenResponse> {
  const params: Record<string, string> = {
    grant_type: "refresh_token",
    refresh_token: refresh_token,
    client_id: Config.CERNER_CLIENT_ID,
  };

  if (scope) {
    params.scope = scope;
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Token refresh failed: ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        errorMessage = `OAuth Error: ${errorData.error}`;
        if (errorData.error_description) {
          errorMessage += ` - ${errorData.error_description}`;
        }
      }
    } catch {
      errorMessage += ` - ${errorText}`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export function useTokenExchange() {
  return useMutation({
    mutationFn: exchangeCodeForToken,
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: refreshAccessToken,
  });
}
