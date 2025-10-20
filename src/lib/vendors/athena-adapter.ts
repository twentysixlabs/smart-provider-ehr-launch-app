/**
 * Athena Vendor Adapter
 *
 * Athena Health-specific implementation with practice ID handling
 */

import { BaseAdapter } from './base-adapter';
import type { VendorAdapter } from './base-adapter';
import type { SmartConfiguration } from '@/types/smart';

export class AthenaAdapter extends BaseAdapter implements VendorAdapter {
  name = 'athena' as const;

  /**
   * Athena uses .read syntax (no transformation needed)
   */
  formatScopes(scopes: string[]): string[] {
    return scopes; // Athena uses standard .read syntax
  }

  /**
   * Athena requires practice ID in some API calls
   */
  async getSmartConfig(iss: string): Promise<SmartConfiguration> {
    const config = await super.getSmartConfig(iss);

    // Extract practice ID from ISS URL if present
    if (iss.includes('athenahealth.com') || iss.includes('athenanet')) {
      const practiceId = this.extractPracticeIdFromIss(iss);
      if (practiceId) {
        // Store practice ID for later use
        (config as SmartConfiguration & { practiceId?: string }).practiceId = practiceId;
      }
    }

    return config;
  }

  /**
   * Extract practice ID from Athena ISS URL
   * Example: https://api.athenahealth.com/fhir/r4/12345/ -> "12345"
   */
  private extractPracticeIdFromIss(iss: string): string | null {
    const match = iss.match(/\/r4\/([0-9]+)/);
    return match ? match[1] : null;
  }

  /**
   * Athena has specific rate limiting (10 requests/second per practice)
   */
  async handleRateLimit(response: Response): Promise<void> {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : 60000;

      // Wait for the specified delay
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  /**
   * Athena-specific error handling
   */
  handleError(error: unknown): Error {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('practice')) {
        return new Error(
          'Athena practice configuration error. Verify the ISS URL includes a valid practice ID.'
        );
      }

      if (errorMessage.includes('marketplace')) {
        return new Error(
          'This app must be registered in the Athena Marketplace. Contact Athena Health support.'
        );
      }

      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return new Error(
          'Athena rate limit exceeded (10 requests/second). Please wait before retrying.'
        );
      }

      return error;
    }

    return new Error(String(error));
  }

  /**
   * Override to handle Athena rate limiting
   */
  override async searchResources<T extends Resource>(
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

      // Handle rate limiting
      if (response.status === 429) {
        await this.handleRateLimit(response);
        // Retry the request
        return this.searchResources(url, token);
      }

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
}
