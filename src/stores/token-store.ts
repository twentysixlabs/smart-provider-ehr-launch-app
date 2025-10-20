import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { TokenData } from '@/types';

interface TokenStore {
  token: TokenData | null;
  setToken: (token: TokenData | null) => void;
  updateToken: (updates: Partial<TokenData>) => void;
  clearToken: () => void;
  isTokenExpired: () => boolean;
  getTimeUntilExpiry: () => number;
}

const MILLISECONDS_PER_SECOND = 1000;

function calculateTokenExpiry(expiresIn: number): number {
  return Date.now() + expiresIn * MILLISECONDS_PER_SECOND;
}

export const useTokenStore = create<TokenStore>()(
  devtools(
    persist(
      (set, get) => ({
        token: null,

        setToken: (newToken: TokenData | null) => {
          if (newToken?.expires_in) {
            const tokenWithExpiry: TokenData = {
              ...newToken,
              token_expiry: calculateTokenExpiry(newToken.expires_in),
            };
            set({ token: tokenWithExpiry }, false, 'setToken');
          } else if (newToken) {
            set({ token: newToken }, false, 'setToken');
          } else {
            set({ token: null }, false, 'clearToken');
          }
        },

        updateToken: (updates: Partial<TokenData>) => {
          const currentToken = get().token;
          if (!currentToken) return;

          let updatedToken: TokenData = { ...currentToken, ...updates };

          if (updates.expires_in) {
            updatedToken = {
              ...updatedToken,
              token_expiry: calculateTokenExpiry(updates.expires_in),
            };
          }

          set({ token: updatedToken }, false, 'updateToken');
        },

        clearToken: () => {
          set({ token: null }, false, 'clearToken');
        },

        isTokenExpired: () => {
          const token = get().token;
          if (!token?.token_expiry) return true;
          return token.token_expiry < Date.now();
        },

        getTimeUntilExpiry: () => {
          const token = get().token;
          if (!token?.token_expiry) return 0;
          const timeRemaining = token.token_expiry - Date.now();
          return Math.max(0, timeRemaining);
        },
      }),
      {
        name: 'smart-token-storage',
        partialize: (state) => ({ token: state.token }),
      }
    ),
    { name: 'TokenStore' }
  )
);
