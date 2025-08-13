/* cspell:ignore Fhir FHIR cooldown COOLDOWN */
import { storage } from "../../../core/storage";
import Config from "../../../environment/config.json";
import type { TokenData } from "../contexts/TokenContext";

interface RefreshTokenParams {
  refresh_token: string;
  tokenUrl: string;
  scope?: string;
}

interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
  patient?: string;
  encounter?: string;
}

/**
 * Singleton class to manage token refresh and prevent race conditions
 */
class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private refreshPromise: Promise<TokenResponse> | null = null;
  private lastRefreshTime = 0;
  private REFRESH_COOLDOWN = 5000;

  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  /**
   * Refreshes the token, ensuring only one refresh happens at a time
   */
  async refreshToken(
    currentToken: TokenData,
    refreshFn: (params: RefreshTokenParams) => Promise<TokenResponse>
  ): Promise<TokenResponse> {
    const now = Date.now();
    
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (now - this.lastRefreshTime < this.REFRESH_COOLDOWN) {
      throw new Error("Token was recently refreshed. Please try again.");
    }

    if (!currentToken?.refresh_token) {
      throw new Error("No refresh token available");
    }

    const tokenUrl = storage.getItem(Config.STORAGE_KEYS.TOKEN_URL);
    if (!tokenUrl) {
      throw new Error("Token URL not found. Please log in again.");
    }

    this.refreshPromise = refreshFn({
      refresh_token: currentToken.refresh_token,
      tokenUrl,
      scope: currentToken.scope,
    })
      .then((newTokenData) => {
        this.lastRefreshTime = Date.now();
        return newTokenData;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

}

export const tokenRefreshManager = TokenRefreshManager.getInstance();