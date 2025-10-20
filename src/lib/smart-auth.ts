import type {
  AuthorizationParams,
  OAuthState,
  SmartConfiguration,
  TokenData,
  TokenExchangeRequest,
  TokenRefreshRequest,
} from '@/types';
import { generatePKCEChallenge } from './pkce';
import { storage } from './storage';
import { generateRandomString } from './utils';

const WELL_KNOWN_SMART_CONFIG = '.well-known/smart-configuration';

/**
 * Fetch SMART configuration from FHIR server
 */
export async function fetchSmartConfiguration(fhirBaseUrl: string): Promise<SmartConfiguration> {
  const configUrl = `${fhirBaseUrl}/${WELL_KNOWN_SMART_CONFIG}`;

  try {
    const response = await fetch(configUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch SMART configuration: ${response.statusText}`);
    }

    const config = (await response.json()) as SmartConfiguration;

    if (!(config.authorization_endpoint && config.token_endpoint)) {
      throw new Error('Invalid SMART configuration: missing required endpoints');
    }

    return config;
  } catch (error) {
    throw new Error(
      `Failed to fetch SMART configuration from ${configUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Initialize SMART authorization flow
 */
export async function initializeSmartAuth(
  iss: string,
  clientId: string,
  redirectUri: string,
  scopes: string[],
  launch?: string
): Promise<string> {
  // Fetch SMART configuration
  const config = await fetchSmartConfiguration(iss);

  // Generate PKCE challenge
  const pkce = await generatePKCEChallenge();

  // Generate state parameter
  const state = generateRandomString(32);

  // Store OAuth state
  const oAuthState: OAuthState = {
    state,
    codeVerifier: pkce.codeVerifier,
    iss,
    launch,
    redirectUri,
    timestamp: Date.now(),
  };

  storage.setItem('oauth-state', JSON.stringify(oAuthState));
  storage.setItem('fhir-base-url', iss);
  storage.setItem('authorization-url', config.authorization_endpoint);
  storage.setItem('token-url', config.token_endpoint);

  // Build authorization URL
  const authParams: AuthorizationParams = {
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state,
    aud: iss,
    code_challenge: pkce.codeChallenge,
    code_challenge_method: 'S256',
  };

  if (launch) {
    authParams.launch = launch;
  }

  const authUrl = new URL(config.authorization_endpoint);
  Object.entries(authParams).forEach(([key, value]) => {
    if (value !== undefined) {
      authUrl.searchParams.append(key, value);
    }
  });

  return authUrl.toString();
}

/**
 * Handle OAuth callback and exchange code for tokens
 */
export async function handleOAuthCallback(
  code: string,
  state: string,
  clientId: string
): Promise<TokenData> {
  // Retrieve stored OAuth state
  const storedStateJson = storage.getItem('oauth-state');
  if (!storedStateJson) {
    throw new Error('No OAuth state found in storage');
  }

  const storedState = JSON.parse(storedStateJson) as OAuthState;

  // Verify state parameter
  if (state !== storedState.state) {
    throw new Error('State parameter mismatch');
  }

  // Check if state is not too old (5 minutes)
  const stateAge = Date.now() - storedState.timestamp;
  if (stateAge > 5 * 60 * 1000) {
    throw new Error('OAuth state has expired');
  }

  // Get token endpoint
  const tokenUrl = storage.getItem('token-url');
  if (!tokenUrl) {
    throw new Error('Token URL not found in storage');
  }

  // Exchange code for tokens
  const tokenRequest: TokenExchangeRequest = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: storedState.redirectUri,
    client_id: clientId,
    code_verifier: storedState.codeVerifier,
  };

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(
      Object.entries(tokenRequest).map(([k, v]) => [k, String(v)])
    ).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`);
  }

  const tokenData = (await response.json()) as TokenData;

  // Clean up OAuth state
  storage.removeItem('oauth-state');

  return tokenData;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<TokenData> {
  const tokenUrl = storage.getItem('token-url');
  if (!tokenUrl) {
    throw new Error('Token URL not found in storage');
  }

  const refreshRequest: TokenRefreshRequest = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  };

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(
      Object.entries(refreshRequest).map(([k, v]) => [k, String(v)])
    ).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.statusText} - ${errorText}`);
  }

  const tokenData = (await response.json()) as TokenData;
  return tokenData;
}

/**
 * Make an authenticated FHIR API request
 */
export async function fetchFhirResource<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/fhir+json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FHIR API request failed: ${response.statusText} - ${errorText}`);
  }

  return (await response.json()) as T;
}
