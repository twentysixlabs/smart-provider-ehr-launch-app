/**
 * Vendor Store
 *
 * Zustand store for tracking current EHR vendor (Epic, Cerner, Athena)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VendorType, VendorContext } from '@/types/vendor';

interface VendorStore {
  vendor: VendorType;
  context: VendorContext | null;
  
  setVendor: (vendor: VendorType, iss: string) => void;
  setContext: (context: VendorContext) => void;
  clearVendor: () => void;
}

export const useVendorStore = create<VendorStore>()(
  persist(
    (set) => ({
      vendor: 'unknown',
      context: null,

      setVendor: (vendor, iss) => {
        set({
          vendor,
          context: {
            vendor,
            iss,
          },
        });
      },

      setContext: (context) => {
        set({ context, vendor: context.vendor });
      },

      clearVendor: () => {
        set({ vendor: 'unknown', context: null });
      },
    }),
    {
      name: 'vendor-storage',
    }
  )
);
