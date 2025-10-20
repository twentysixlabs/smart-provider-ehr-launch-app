/**
 * Vendor Detection Utility
 *
 * Detects EHR vendor from ISS URL and provides vendor adapters
 */

import type { VendorType } from '@/types/vendor';
import { AthenaAdapter } from './vendors/athena-adapter';
import type { VendorAdapter } from './vendors/base-adapter';
import { CernerAdapter } from './vendors/cerner-adapter';
import { EpicAdapter } from './vendors/epic-adapter';

/**
 * Detect vendor from ISS URL
 */
export function detectVendor(iss: string): VendorType {
  if (!iss) {
    return 'unknown';
  }

  const url = iss.toLowerCase();

  // Epic detection
  if (url.includes('epic.com') || url.includes('epiccare') || url.includes('/epic/')) {
    return 'epic';
  }

  // Cerner detection (including Oracle Health)
  if (
    url.includes('cerner.com') ||
    url.includes('cernercare') ||
    url.includes('oracle.com/health') ||
    url.includes('/cerner/')
  ) {
    return 'cerner';
  }

  // Athena detection
  if (url.includes('athenahealth.com') || url.includes('athenanet')) {
    return 'athena';
  }

  return 'unknown';
}

/**
 * Get vendor adapter instance for a given vendor type
 */
export function getVendorAdapter(vendor: VendorType): VendorAdapter {
  switch (vendor) {
    case 'epic':
      return new EpicAdapter();
    case 'cerner':
      return new CernerAdapter();
    case 'athena':
      return new AthenaAdapter();
    default:
      throw new Error(`Unsupported vendor: ${vendor}`);
  }
}

/**
 * Get vendor display name
 */
export function getVendorDisplayName(vendor: VendorType): string {
  switch (vendor) {
    case 'epic':
      return 'Epic';
    case 'cerner':
      return 'Cerner / Oracle Health';
    case 'athena':
      return 'Athena Health';
    default:
      return 'Unknown EHR';
  }
}
