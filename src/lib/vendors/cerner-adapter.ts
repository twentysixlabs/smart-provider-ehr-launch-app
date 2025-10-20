/**
 * Cerner Vendor Adapter
 *
 * Cerner/Oracle Health-specific implementation with tenant handling
 */

import { BaseAdapter } from './base-adapter';
import type { VendorAdapter } from './base-adapter';
import type { SmartConfiguration } from '@/types/smart';

export class CernerAdapter extends BaseAdapter implements VendorAdapter {
  name = 'cerner' as const;

  /**
   * Cerner uses .read syntax (no transformation needed)
   */
  formatScopes(scopes: string[]): string[] {
    return scopes; // Cerner uses standard .read syntax
  }

  /**
   * Cerner requires tenant parameter in some scenarios
   */
  async getSmartConfig(iss: string): Promise<SmartConfiguration> {
    const config = await super.getSmartConfig(iss);

    // Extract tenant ID from ISS URL if present
    if (iss.includes('.cerner.com') || iss.includes('oracle.com/health')) {
      const tenant = this.extractTenantFromIss(iss);
      if (tenant) {
        // Store tenant for later use
        (config as SmartConfiguration & { tenant?: string }).tenant = tenant;
      }
    }

    return config;
  }

  /**
   * Extract tenant ID from Cerner ISS URL
   * Example: https://fhir-myrecord.cerner.com/r4/tenant/12345/fhir -> "12345"
   */
  private extractTenantFromIss(iss: string): string | null {
    const match = iss.match(/\/tenant\/([^/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Cerner-specific error handling
   */
  handleError(error: unknown): Error {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('tenant')) {
        return new Error(
          'Cerner tenant configuration error. Verify the ISS URL includes a valid tenant ID.'
        );
      }

      if (errorMessage.includes('dstu2')) {
        return new Error(
          'This Cerner environment uses FHIR DSTU2, but the app requires R4. Contact Cerner support to upgrade.'
        );
      }

      if (errorMessage.includes('validation')) {
        return new Error(
          'Cerner FHIR validation failed. Ensure all required fields are included in the request.'
        );
      }

      return error;
    }

    return new Error(String(error));
  }

  /**
   * Cerner prefers the "Prefer: return=representation" header for write operations
   */
  getWriteHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
      Prefer: 'return=representation', // Return created/updated resource
    };
  }

  /**
   * Override create to add Cerner-specific headers
   */
  override async createResource<T extends Resource>(
    url: string,
    resource: Omit<T, 'id' | 'meta'>,
    token: string
  ): Promise<import('@/types/write-operations').WriteResult<T>> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...this.getWriteHeaders(),
        },
        body: JSON.stringify(resource),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to create resource: ${response.status} ${response.statusText}`,
          statusCode: response.status,
        };
      }

      const created = (await response.json()) as T;
      return {
        success: true,
        resource: created,
        statusCode: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Override update to add Cerner-specific headers
   */
  override async updateResource<T extends Resource>(
    url: string,
    resourceId: string,
    resource: T,
    token: string
  ): Promise<import('@/types/write-operations').WriteResult<T>> {
    try {
      const response = await fetch(`${url}/${resourceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          ...this.getWriteHeaders(),
        },
        body: JSON.stringify(resource),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to update resource: ${response.status} ${response.statusText}`,
          statusCode: response.status,
        };
      }

      const updated = (await response.json()) as T;
      return {
        success: true,
        resource: updated,
        statusCode: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cerner write support
   *
   * Cerner supports write for most resource types
   */
  override supportsWrite(resourceType: string): boolean {
    const cernerWritableResources = [
      'DocumentReference',
      'Observation',
      'MedicationRequest',
      'AllergyIntolerance',
      'Condition', // Cerner supports Condition writes (unlike Epic)
    ];
    return cernerWritableResources.includes(resourceType);
  }
}
