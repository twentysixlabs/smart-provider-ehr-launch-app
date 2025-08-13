import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Config from "../../../environment/config.json";
import { AppRoutes } from "../../../core/routing/AppRoutes";
import { concatPath } from "../../../core/utils/urlUtils";
import { storage } from "../../../core/storage";
import type { StorageRepository } from "../../../core/storage";
import { generateCodeChallenge } from "../utils/pkce";
import { getOrCreateOAuthState } from "../utils/oauth-state";
import { useWellKnownMetadata } from "../hooks/useAuthQueries";

interface AuthorizationParams {
  authorizationUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
  launch: string;
  scopes: string[];
  state: string;
  iss: string;
  codeChallenge: string;
}

/**
 * Builds the authorization URL for SMART on FHIR OAuth flow
 * @param params Authorization parameters including endpoints, client info, and PKCE challenge
 * @returns Fully constructed authorization URL with query parameters
 */
function buildAuthorizationUrl(params: AuthorizationParams): string {
  const queryParams = {
    response_type: "code",
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    launch: params.launch,
    scope: params.scopes.join(" "),
    state: params.state,
    aud: params.iss,
    code_challenge_method: "S256",
    code_challenge: params.codeChallenge,
  };

  return `${params.authorizationUrl}?${new URLSearchParams(
    queryParams
  ).toString()}`;
}

function clearAuthFlowStorage(storage: StorageRepository): void {
  storage.removeItem(Config.STORAGE_KEYS.OAUTH_STATE);
  storage.removeItem(Config.STORAGE_KEYS.CODE_VERIFIER);
}

function storeAuthEndpoints(
  authorizationUrl: string,
  tokenUrl: string,
  storage: StorageRepository
): void {
  storage.setItem(Config.STORAGE_KEYS.AUTHORIZATION_URL, authorizationUrl);
  storage.setItem(Config.STORAGE_KEYS.TOKEN_URL, tokenUrl);
}

function storeFHIRBaseUrl(iss: string, storage: StorageRepository): void {
  storage.setItem(Config.STORAGE_KEYS.FHIR_BASE_URL, iss);
}

export function SmartInitialLogin() {
  const [searchParams] = useSearchParams();
  const [authUrl, setAuthUrl] = React.useState("");

  const iss = searchParams.get("iss");
  const launch = searchParams.get("launch");

  const { data: metadata, isLoading, error } = useWellKnownMetadata(iss);

  useEffect(() => {
    if (!iss || !launch || !metadata) return;

    clearAuthFlowStorage(storage);

    generateCodeChallenge(storage)
      .then((codeChallenge) => {
        const authorizationUrl = metadata.authorization_endpoint;
        const tokenUrl = metadata.token_endpoint;

        if (!tokenUrl || !authorizationUrl) {
          console.error("Required URLs not found in metadata");
          return;
        }

        storeAuthEndpoints(authorizationUrl, tokenUrl, storage);

        storeFHIRBaseUrl(iss, storage);

        const url = buildAuthorizationUrl({
          authorizationUrl,
          tokenUrl,
          clientId: Config.CLIENT_ID,
          redirectUri: concatPath(Config.BASE_URL, AppRoutes.SmartCallback),
          launch,
          scopes: Config.SMART_SCOPES,
          state: getOrCreateOAuthState(storage),
          iss,
          codeChallenge,
        });

        setAuthUrl(url);
      })
      .catch((error) => {
        console.error("Error generating code challenge:", error);
      });
  }, [iss, launch, metadata]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authUrl) {
        window.location.href = authUrl;
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [authUrl]);

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-red-500">
          Failed to fetch authentication configuration: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Smart Login</h1>
      {isLoading ? (
        <p>Loading authentication configuration...</p>
      ) : authUrl ? (
        <div>
          <p>
            If you are not automatically redirected, click the link below to log
            in:
          </p>
          <a className="text-blue-600 hover:underline" href={authUrl}>
            Login
          </a>
        </div>
      ) : (
        <p>Preparing authentication...</p>
      )}
    </div>
  );
}
