import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Config from "../../../config.json";
import { AppRoutes } from "../../../core/routing/AppRoutes";
import { concatPath } from "../../../core/utils/urlUtils";
import { getCodeChallenge } from "../utils/pkce";
import { getOAuth2State } from "../utils/oauth-state";
import { useWellKnownMetadata } from "../hooks/useAuthQueries";

export function SmartInitialLogin() {
  const [searchParams] = useSearchParams();
  const [authUrl, setAuthUrl] = React.useState("");
  const [codeChallenge, setCodeChallenge] = React.useState<string | null>(null);

  const iss = searchParams.get("iss");
  const launch = searchParams.get("launch");

  const { data: metadata, isLoading, error } = useWellKnownMetadata(iss);

  useEffect(() => {
    if (iss && launch) {
      // Clear any existing auth values to ensure fresh login
      localStorage.removeItem(Config.STORAGE_KEYS.OAUTH_STATE);
      localStorage.removeItem(Config.STORAGE_KEYS.CODE_VERIFIER);

      getCodeChallenge()
        .then(setCodeChallenge)
        .catch((error) => {
          console.error("Error generating code challenge:", error);
        });
    }
  }, [iss, launch]);

  // Build authorization URL when metadata and code challenge are ready
  useEffect(() => {
    if (metadata && codeChallenge && iss && launch) {
      const AUTHORIZATION_URL = metadata.authorization_endpoint;
      const TOKEN_URL = metadata.token_endpoint;

      if (!TOKEN_URL || !AUTHORIZATION_URL) {
        console.error("Required URLs not found in metadata");
        return;
      }

      localStorage.setItem(
        Config.STORAGE_KEYS.AUTHORIZATION_URL,
        AUTHORIZATION_URL
      );
      localStorage.setItem(Config.STORAGE_KEYS.TOKEN_URL, TOKEN_URL);

      const params = {
        response_type: "code",
        client_id: Config.CERNER_CLIENT_ID,
        redirect_uri: concatPath(Config.BASE_URL, AppRoutes.CernerCallback),
        launch: launch,
        scope: Config.SMART_SCOPES.join(" "),
        state: getOAuth2State(),
        aud: iss,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
      };

      const authorizationUrl = `${AUTHORIZATION_URL}?${new URLSearchParams(
        params
      ).toString()}`;

      setAuthUrl(authorizationUrl);
    }
  }, [metadata, codeChallenge, iss, launch]);

  useEffect(() => {
    if (authUrl) {
      window.location.href = authUrl;
    }
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
      <h1 className="text-3xl font-bold mb-4">Cerner Login</h1>
      {isLoading ? (
        <p>Loading authentication configuration...</p>
      ) : authUrl ? (
        <div>
          <p>Click the link below to log in:</p>
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
