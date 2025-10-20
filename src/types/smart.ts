/**
 * SMART on FHIR Authorization Types
 */

// OAuth Token Response
export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  patient?: string;
  encounter?: string;
  location?: string;
  resource?: string;
  intent?: string;
  smart_style_url?: string;
  need_patient_banner?: boolean;
  tenant?: string;
  id_token?: string;
  token_expiry?: number;
  fhirUser?: string;
}

// SMART Configuration from .well-known/smart-configuration
export interface SmartConfiguration {
  issuer?: string;
  jwks_uri?: string;
  authorization_endpoint: string;
  token_endpoint: string;
  token_endpoint_auth_methods_supported?: string[];
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported?: string[];
  management_endpoint?: string;
  introspection_endpoint?: string;
  revocation_endpoint?: string;
  capabilities?: string[];
  code_challenge_methods_supported?: string[];
  grant_types_supported?: string[];
}

// OAuth State stored during authorization
export interface OAuthState {
  state: string;
  codeVerifier: string;
  iss: string;
  launch?: string;
  redirectUri: string;
  timestamp: number;
}

// Launch Parameters
export interface LaunchParams {
  iss: string;
  launch?: string;
}

// App Configuration
export interface AppConfig {
  CLIENT_ID: string;
  BASE_URL: string;
  SMART_SCOPES: string[];
  STORAGE_KEYS: {
    OAUTH_STATE: string;
    CODE_VERIFIER: string;
    TOKEN_DATA: string;
    AUTHORIZATION_URL: string;
    TOKEN_URL: string;
    FHIR_BASE_URL: string;
  };
  STORAGE_TYPE: 'local' | 'session';
}

// Token refresh request
export interface TokenRefreshRequest {
  grant_type: 'refresh_token';
  refresh_token: string;
  client_id: string;
}

// Authorization request parameters
export interface AuthorizationParams {
  response_type: 'code';
  client_id: string;
  redirect_uri: string;
  launch?: string;
  scope: string;
  state: string;
  aud: string;
  code_challenge: string;
  code_challenge_method: 'S256';
}

// Token exchange request
export interface TokenExchangeRequest {
  grant_type: 'authorization_code';
  code: string;
  redirect_uri: string;
  client_id: string;
  code_verifier: string;
}

// Token context
export interface TokenContextValue {
  token: TokenData | null;
  setToken: (token: TokenData | null) => void;
  updateToken: (updates: Partial<TokenData>) => void;
}

// Token expiry information
export interface TokenExpiryInfo {
  isExpired: boolean;
  timeRemaining: string;
  expiresAt: Date | null;
  canRefresh: boolean;
}

// PKCE (Proof Key for Code Exchange) utilities
export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
}

// Storage repository interface
export interface StorageRepository {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

// Error types
export interface SmartAuthError extends Error {
  code?: string;
  description?: string;
}

export interface FhirApiError extends Error {
  status?: number;
  statusText?: string;
  response?: unknown;
}

// Query parameters from OAuth redirect
export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}
