/**
 * Vendor Adapter Hook
 *
 * React hook for accessing the current vendor adapter
 */

'use client';

import { useMemo } from 'react';
import { useVendorStore } from '@/stores/vendor-store';
import { detectVendor, getVendorAdapter } from '@/lib/vendor-detection';
import type { VendorAdapter } from '@/lib/vendors/base-adapter';
import type { VendorType } from '@/types/vendor';

export function useVendorAdapter(): VendorAdapter | null {
  const { vendor, context } = useVendorStore();

  return useMemo(() => {
    // If we have a stored vendor, use it
    if (vendor && vendor !== 'unknown') {
      try {
        return getVendorAdapter(vendor);
      } catch {
        return null;
      }
    }

    // Try to detect vendor from stored context
    if (context?.iss) {
      const detectedVendor = detectVendor(context.iss);
      if (detectedVendor !== 'unknown') {
        try {
          return getVendorAdapter(detectedVendor);
        } catch {
          return null;
        }
      }
    }

    return null;
  }, [vendor, context]);
}

export function useVendor(): {
  vendor: VendorType;
  adapter: VendorAdapter | null;
  isEpic: boolean;
  isCerner: boolean;
  isAthena: boolean;
} {
  const { vendor } = useVendorStore();
  const adapter = useVendorAdapter();

  return {
    vendor,
    adapter,
    isEpic: vendor === 'epic',
    isCerner: vendor === 'cerner',
    isAthena: vendor === 'athena',
  };
}
