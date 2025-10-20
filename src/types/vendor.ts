/**
 * Vendor-Specific Types
 *
 * Types for Epic, Cerner, and Athena vendor-specific functionality
 */

export type VendorType = 'epic' | 'cerner' | 'athena' | 'unknown';

export interface VendorContext {
  vendor: VendorType;
  iss: string;
  tenant?: string; // Cerner-specific
  practiceId?: string; // Athena-specific
  smartStyleUrl?: string; // Epic-specific
}

export interface VendorConfig {
  name: VendorType;
  displayName: string;
  scopeFormat: 'rs' | 'read'; // Epic uses .rs, others use .read
  requiresTenant: boolean;
  requiresPracticeId: boolean;
  supportsSmartStyles: boolean;
}

export const VENDOR_CONFIGS: Record<VendorType, VendorConfig | null> = {
  epic: {
    name: 'epic',
    displayName: 'Epic',
    scopeFormat: 'rs',
    requiresTenant: false,
    requiresPracticeId: false,
    supportsSmartStyles: true,
  },
  cerner: {
    name: 'cerner',
    displayName: 'Cerner / Oracle Health',
    scopeFormat: 'read',
    requiresTenant: true,
    requiresPracticeId: false,
    supportsSmartStyles: false,
  },
  athena: {
    name: 'athena',
    displayName: 'Athena Health',
    scopeFormat: 'read',
    requiresTenant: false,
    requiresPracticeId: true,
    supportsSmartStyles: false,
  },
  unknown: null,
};
