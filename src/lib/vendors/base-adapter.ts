/**
 * Base Vendor Adapter
 *
 * Abstract base class for vendor-specific adapters
 */

import type { Bundle, Resource } from '@medplum/fhirtypes';
import type { SmartConfiguration, TokenData } from '@/types/smart';
import type { VendorType } from '@/types/vendor';

export interface AuthParams {
  iss: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  launch?: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod?: string;
}

export interface VendorAdapter {
  name: VendorType;

  // OAuth configuration
  getSmartConfig(iss: string): Promise<SmartConfiguration>;
  getAuthorizationUrl(params: AuthParams): Promise<string>;
  
  // FHIR read operations
  readResource<T extends Resource>(url: string, token: string): Promise<T>;
  searchResources<T extends Resource>(url: string, token: string): Promise<Bundle<T>>;
  
  // Vendor-specific scope formatting
  formatScopes(scopes: string[]): string[];
  
  // Vendor-specific error handling
  handleError(error: unknown): Error;
}

export abstract class BaseAdapter implements VendorAdapter {
  abstract name: VendorType;

  async getSmartConfig(iss: string): Promise<SmartConfiguration> {
    const wellKnownUrl = `${iss}/.well-known/smart-configuration`;

    try {
      const response = await fetch(wellKnownUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch SMART configuration: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAuthorizationUrl(params: AuthParams): Promise<string> {
    const config = await this.getSmartConfig(params.iss);

    const authUrl = new URL(config.authorization_endpoint);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', params.clientId);
    authUrl.searchParams.set('redirect_uri', params.redirectUri);
    authUrl.searchParams.set('scope', params.scopes.join(' '));
    authUrl.searchParams.set('state', params.state);
    authUrl.searchParams.set('aud', params.iss);
    authUrl.searchParams.set('code_challenge', params.codeChallenge);
    authUrl.searchParams.set('code_challenge_method', params.codeChallengeMethod || 'S256');

    if (params.launch) {
      authUrl.searchParams.set('launch', params.launch);
    }

    return authUrl.toString();
  }

  async readResource<T extends Resource>(url: string, token: string): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/fhir+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to read resource: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchResources<T extends Resource>(
    url: string,
    token: string
  ): Promise<Bundle<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/fhir+json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to search resources: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Default scope formatting (can be overridden by subclasses)
  formatScopes(scopes: string[]): string[] {
    return scopes;
  }

  // Default error handling (can be overridden by subclasses)
  handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }
}
