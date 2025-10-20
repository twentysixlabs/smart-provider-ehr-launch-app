/**
 * Epic Vendor Adapter
 *
 * Epic-specific implementation with .rs scope syntax
 */

import type { TokenData } from '@/types/smart';

import type { VendorAdapter } from './base-adapter';
import { BaseAdapter } from './base-adapter';

export class EpicAdapter extends BaseAdapter implements VendorAdapter {
  name = 'epic' as const;

  /**
   * Epic uses .rs (read scope) syntax instead of .read
   * Example: patient/Observation.rs instead of patient/Observation.read
   */
  override formatScopes(scopes: string[]): string[] {
    return scopes.map((scope) => {
      if (scope.includes('.read')) {
        return scope.replace('.read', '.rs');
      }
      // Also handle write scopes (.ws)
      if (scope.includes('.write')) {
        return scope.replace('.write', '.ws');
      }
      return scope;
    });
  }

  /**
   * Epic-specific error codes and messages
   */
  override handleError(error: unknown): Error {
    if (error instanceof Error) {
      // Check for Epic-specific error patterns
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('scope') && errorMessage.includes('denied')) {
        return new Error(
          'Epic requires additional scope approval. Contact your Epic administrator to grant the necessary permissions.'
        );
      }

      if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
        return new Error(
          'Access forbidden by Epic. Verify your app has been approved in Epic App Orchard.'
        );
      }

      if (errorMessage.includes('rate limit')) {
        return new Error(
          'Epic rate limit exceeded (100 requests/minute). Please wait before retrying.'
        );
      }

      return error;
    }

    return new Error(String(error));
  }

  /**
   * Epic provides smart_style_url for UI customization
   */
  async getPatientBannerStyles(token: TokenData): Promise<string | null> {
    // Epic includes smart_style_url in the token response
    // This URL points to CSS that matches Epic's UI
    if ('smart_style_url' in token) {
      return token.smart_style_url as string;
    }
    return null;
  }

  /**
   * Epic write support
   *
   * Epic supports write for:
   * - DocumentReference (clinical notes)
   * - Observation (lab results, vitals)
   * - MedicationRequest (prescriptions)
   * - AllergyIntolerance (allergy list)
   *
   * Epic does NOT support write for:
   * - Condition (read-only)
   * - Encounter (read-only)
   */
  override supportsWrite(resourceType: string): boolean {
    const epicWritableResources = [
      'DocumentReference',
      'Observation',
      'MedicationRequest',
      'AllergyIntolerance',
    ];
    return epicWritableResources.includes(resourceType);
  }
}
